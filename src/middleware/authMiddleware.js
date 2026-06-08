import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "Not authorized, token missing" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "Not authorized, user not found" });

    req.user = user;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, message: "Not authorized, token invalid" });
  }
};

const adminOnly = (req, res, next) => {
  if (!req.user)
    return res.status(401).json({ success: false, message: "Not authorized" });
  if (req.user.role !== "admin")
    return res
      .status(403)
      .json({ success: false, message: "Admin only resource" });
  next();
};

export { protect, adminOnly };
