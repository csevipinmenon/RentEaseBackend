import User from "../models/User.js";
import Product from "../models/Product.js";
import Rental from "../models/Rental.js";
import Maintenance from "../models/Maintenance.js";
import ServiceArea from "../models/ServiceArea.js";

// @desc Get dashboard stats
// @route GET /api/admin/stats
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalProducts,
      activeRentals,
      totalRentals,
      pendingMaintenance,
      returnRequests,
    ] = await Promise.all([
      User.countDocuments({ role: "user" }),
      Product.countDocuments({ isActive: true }),
      Rental.countDocuments({ status: "active" }),
      Rental.countDocuments(),
      Maintenance.countDocuments({ status: "open" }),
      Rental.countDocuments({ status: "return_requested" }),
    ]);

    // Monthly Revenue (active rentals)
    const activeRentalDocs = await Rental.find({
      status: { $in: ["active", "delivered"] },
    });
    const monthlyRevenue = activeRentalDocs.reduce(
      (sum, r) => sum + r.totalMonthlyRent,
      0,
    );

    // Status distribution
    const rentalsByStatus = await Rental.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // Recent rentals
    const recentRentals = await Rental.find()
      .populate("user", "name email")
      .populate("items.product", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    // Top products (by rental count)
    const topProducts = await Rental.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          count: { $sum: 1 },
          revenue: { $sum: "$items.monthlyRent" },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $project: {
          name: "$product.name",
          subCategory: "$product.subCategory",
          count: 1,
          revenue: 1,
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalProducts,
        activeRentals,
        totalRentals,
        pendingMaintenance,
        returnRequests,
        monthlyRevenue,
        rentalsByStatus,
        recentRentals,
        topProducts,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get all users
// @route GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = { role: "user" };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      data: users,
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

// @desc Get all service areas
// @route GET /api/admin/service-areas
const getServiceAreas = async (req, res) => {
  try {
    const serviceAreas = await ServiceArea.find().sort({ createdAt: -1 });
    res.json({ success: true, data: serviceAreas });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Create service area
// @route POST /api/admin/service-areas
const createServiceArea = async (req, res) => {
  try {
    const serviceArea = await ServiceArea.create(req.body);
    res.status(201).json({
      success: true,
      message: "Service area created",
      data: serviceArea,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update service area
// @route PUT /api/admin/service-areas/:id
const updateServiceArea = async (req, res) => {
  try {
    const serviceArea = await ServiceArea.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    if (!serviceArea)
      return res
        .status(404)
        .json({ success: false, message: "Service area not found" });
    res.json({
      success: true,
      message: "Service area updated",
      data: serviceArea,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Delete service area
// @route DELETE /api/admin/service-areas/:id
const deleteServiceArea = async (req, res) => {
  try {
    const serviceArea = await ServiceArea.findByIdAndDelete(req.params.id);
    if (!serviceArea)
      return res
        .status(404)
        .json({ success: false, message: "Service area not found" });
    res.json({ success: true, message: "Service area deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Toggle user active status
// @route PUT /api/admin/users/:id/toggle
const toggleUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    user.isActive = !user.isActive;
    await user.save();
    res.json({
      success: true,
      message: `User ${user.isActive ? "activated" : "deactivated"}`,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  getDashboardStats,
  getUsers,
  toggleUser,
  getServiceAreas,
  createServiceArea,
  updateServiceArea,
  deleteServiceArea,
};
