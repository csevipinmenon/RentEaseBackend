import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// @desc Get user cart
// @route GET /api/cart
const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product",
    );
    if (!cart) return res.json({ success: true, data: { items: [] } });
    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Add item to cart
// @route POST /api/cart/add
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, tenureMonths = 3 } = req.body;

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    if (product.availableQty < quantity) {
      return res
        .status(400)
        .json({ success: false, message: "Not enough stock available" });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId,
    );
    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.tenureMonths = tenureMonths;
    } else {
      cart.items.push({ product: productId, quantity, tenureMonths });
    }

    await cart.save();
    await cart.populate("items.product");

    res.json({ success: true, message: "Added to cart", data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update cart item
// @route PUT /api/cart/:itemId
const updateCartItem = async (req, res) => {
  try {
    const { quantity, tenureMonths } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart)
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });

    const item = cart.items.id(req.params.itemId);
    if (!item)
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });

    if (quantity !== undefined) item.quantity = quantity;
    if (tenureMonths !== undefined) item.tenureMonths = tenureMonths;

    if (item.quantity <= 0) {
      cart.items.pull(req.params.itemId);
    }

    await cart.save();
    await cart.populate("items.product");

    res.json({ success: true, message: "Cart updated", data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Remove from cart
// @route DELETE /api/cart/:itemId
const removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart)
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });

    cart.items.pull(req.params.itemId);
    await cart.save();
    await cart.populate("items.product");

    res.json({ success: true, message: "Item removed from cart", data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Clear cart
// @route DELETE /api/cart
const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
    res.json({ success: true, message: "Cart cleared" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
