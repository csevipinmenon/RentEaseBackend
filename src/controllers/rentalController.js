import Rental from "../models/Rental.js";
import Product from "../models/Product.js";
import Cart from "../models/Cart.js";

// @desc Create rental from cart
// @route POST /api/rentals
const createRental = async (req, res) => {
  try {
    const {
      items: requestItems,
      deliveryAddress,
      deliveryDate,
      tenureMonths,
      notes,
    } = req.body;

    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product",
    );

    const normalizedItems =
      Array.isArray(requestItems) && requestItems.length > 0
        ? requestItems
        : (cart?.items || []).map((item) => ({
            productId: item.product?._id || item.product,
            quantity: item.quantity,
            tenureMonths: item.tenureMonths,
          }));

    if (normalizedItems.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    if (
      !deliveryAddress?.street ||
      !deliveryAddress?.city ||
      !deliveryAddress?.state ||
      !deliveryAddress?.pincode
    ) {
      return res.status(400).json({
        success: false,
        message: "Delivery address is required",
      });
    }

    if (!deliveryDate) {
      return res.status(400).json({
        success: false,
        message: "Delivery date is required",
      });
    }

    let totalMonthlyRent = 0;
    let totalSecurityDeposit = 0;
    const rentalItems = [];

    for (const item of normalizedItems) {
      const productId = item.productId || item.product;
      const quantity = Number(item.quantity || 1);
      const itemTenureMonths = Number(tenureMonths || item.tenureMonths || 3);
      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "One or more products were not found",
        });
      }

      if (product.availableQty < quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`,
        });
      }
      totalMonthlyRent += product.monthlyRent * quantity;
      totalSecurityDeposit += product.securityDeposit * quantity;

      const startDate = new Date(deliveryDate);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + itemTenureMonths);

      rentalItems.push({
        product: product._id,
        quantity,
        monthlyRent: product.monthlyRent,
        securityDeposit: product.securityDeposit,
        tenureMonths: itemTenureMonths,
        startDate,
        endDate,
      });

      // Update available qty
      await Product.findByIdAndUpdate(product._id, {
        $inc: { availableQty: -quantity },
      });
    }

    const rental = await Rental.create({
      user: req.user._id,
      items: rentalItems,
      totalMonthlyRent,
      totalSecurityDeposit,
      tenureMonths: Number(
        tenureMonths || normalizedItems[0].tenureMonths || 3,
      ),
      deliveryAddress,
      deliveryDate,
      notes,
    });

    // Clear cart
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

    const populatedRental = await Rental.findById(rental._id).populate(
      "items.product",
      "name images subCategory",
    );

    res.status(201).json({
      success: true,
      message: "Rental created successfully",
      data: populatedRental,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get user rentals
// @route GET /api/rentals/my
const getUserRentals = async (req, res) => {
  try {
    const rentals = await Rental.find({ user: req.user._id })
      .populate("items.product", "name images subCategory category monthlyRent")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: rentals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get single rental
// @route GET /api/rentals/:id
const getRental = async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id)
      .populate("items.product")
      .populate("user", "name email phone");

    if (!rental)
      return res
        .status(404)
        .json({ success: false, message: "Rental not found" });

    // Check ownership or admin
    if (
      rental.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    res.json({ success: true, data: rental });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Request return
// @route PUT /api/rentals/:id/return
const requestReturn = async (req, res) => {
  try {
    const rental = await Rental.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!rental)
      return res
        .status(404)
        .json({ success: false, message: "Rental not found" });

    if (!["active", "delivered"].includes(rental.status)) {
      return res.status(400).json({
        success: false,
        message: "Cannot request return for this rental",
      });
    }

    rental.status = "return_requested";
    rental.returnDate = new Date();
    await rental.save();

    res.json({
      success: true,
      message: "Return requested successfully",
      data: rental,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get all rentals (Admin)
// @route GET /api/rentals
const getAllRentals = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const total = await Rental.countDocuments(query);
    const rentals = await Rental.find(query)
      .populate("user", "name email phone")
      .populate("items.product", "name images subCategory")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      data: rentals,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update rental status (Admin)
// @route PUT /api/rentals/:id/status
const updateRentalStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const rental = await Rental.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    )
      .populate("items.product", "name")
      .populate("user", "name email");

    if (!rental)
      return res
        .status(404)
        .json({ success: false, message: "Rental not found" });

    // If returned, restore inventory
    if (status === "returned") {
      for (const item of rental.items) {
        await Product.findByIdAndUpdate(item.product._id, {
          $inc: { availableQty: item.quantity },
        });
      }
    }

    res.json({ success: true, message: "Rental status updated", data: rental });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  createRental,
  getUserRentals,
  getRental,
  requestReturn,
  getAllRentals,
  updateRentalStatus,
};
