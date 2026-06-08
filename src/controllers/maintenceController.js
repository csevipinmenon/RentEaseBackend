import Maintenance from "../models/Maintenance.js";
import Rental from "../models/Rental.js";

// @desc Create maintenance request
// @route POST /api/maintenance
const createRequest = async (req, res) => {
  try {
    const { rentalId, productId, issueType, description, priority } = req.body;

    const rental = await Rental.findOne({ _id: rentalId, user: req.user._id });
    if (!rental)
      return res
        .status(404)
        .json({ success: false, message: "Rental not found" });

    const request = await Maintenance.create({
      user: req.user._id,
      rental: rentalId,
      product: productId,
      issueType,
      description,
      priority,
    });

    res.status(201).json({
      success: true,
      message: "Maintenance request submitted",
      data: request,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get user maintenance requests
// @route GET /api/maintenance/my
const getUserRequests = async (req, res) => {
  try {
    const requests = await Maintenance.find({ user: req.user._id })
      .populate("product", "name images subCategory")
      .populate("rental", "status deliveryAddress")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get all maintenance requests (Admin)
// @route GET /api/maintenance
const getAllRequests = async (req, res) => {
  try {
    const { status, priority, issueType, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (issueType) query.issueType = issueType;

    const total = await Maintenance.countDocuments(query);
    const requests = await Maintenance.find(query)
      .populate("user", "name email phone")
      .populate("product", "name images subCategory")
      .populate("rental", "status deliveryAddress")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      data: requests,
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

// @desc Update maintenance request (Admin)
// @route PUT /api/maintenance/:id
const updateRequest = async (req, res) => {
  try {
    const { status, adminNotes, scheduledDate, disputeType } = req.body;
    const updates = { status, adminNotes, scheduledDate, disputeType };
    if (status === "resolved") updates.resolvedDate = new Date();

    const request = await Maintenance.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true },
    )
      .populate("user", "name email")
      .populate("product", "name");

    if (!request)
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });
    res.json({ success: true, message: "Request updated", data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export { createRequest, getUserRequests, getAllRequests, updateRequest };
