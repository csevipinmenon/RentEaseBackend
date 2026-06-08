import Product from "../models/Product.js";

// @desc Get all products with filters
// @route GET /api/products
const getProducts = async (req, res) => {
  try {
    const {
      category,
      subCategory,
      city,
      minRent,
      maxRent,
      search,
      page = 1,
      limit = 12,
    } = req.query;

    const query = { isActive: true };

    if (category) query.category = category;
    if (subCategory) query.subCategory = subCategory;
    if (city) query.cities = { $in: [city] };
    if (minRent || maxRent) {
      query.monthlyRent = {};
      if (minRent) query.monthlyRent.$gte = Number(minRent);
      if (maxRent) query.monthlyRent.$lte = Number(maxRent);
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: products,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
        limit: Number(limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get single product
// @route GET /api/products/:id
const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Create product (Admin)
// @route POST /api/products
const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res
      .status(201)
      .json({ success: true, message: "Product created", data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update product (Admin)
// @route PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    res.json({ success: true, message: "Product updated", data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Delete product (Admin)
// @route DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true },
    );
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    res.json({ success: true, message: "Product deactivated" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get categories summary
// @route GET /api/products/categories
const getCategories = async (req, res) => {
  try {
    const categories = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: { category: "$category", subCategory: "$subCategory" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.category": 1 } },
    ]);
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
};
