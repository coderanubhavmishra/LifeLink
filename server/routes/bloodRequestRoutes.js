
const express = require("express");
const BloodRequest = require("../models/BloodRequest");
const protectAdmin = require("../middleware/authMiddleware");
const mongoose = require("mongoose");
const router = express.Router();

const validBloodGroups = [
  "A+", "A-", "B+", "B-",
  "AB+", "AB-", "O+", "O-",
];

const validUrgencies = [
  "Normal",
  "Urgent",
  "Emergency",
];

// 1. Create a blood request
router.post("/", async (req, res) => {
  try {
    const {
      requesterName,
      bloodGroup,
      units,
      hospital,
      city,
      contact,
      urgency,
    } = req.body;

    if (
      !requesterName?.trim() ||
      !bloodGroup ||
      units === undefined ||
      units === "" ||
      !hospital?.trim() ||
      !city?.trim() ||
      !contact?.trim()
    ) {
      return res.status(400).json({
        message: "Please provide all required fields",
      });
    }

    if (!validBloodGroups.includes(bloodGroup)) {
      return res.status(400).json({
        message: "Invalid blood group",
      });
    }

    if (
      !Number.isInteger(Number(units)) ||
      Number(units) < 1 ||
      Number(units) > 20
    ) {
      return res.status(400).json({
        message: "Units must be a whole number from 1 to 20",
      });
    }

    if (
      urgency !== undefined &&
      !validUrgencies.includes(urgency)
    ) {
      return res.status(400).json({
        message: "Invalid urgency",
      });
    }

    const request = await BloodRequest.create({
      requesterName,
      bloodGroup,
      units: Number(units),
      hospital,
      city,
      contact,
      urgency,
    });

    return res.status(201).json({
      message: "Blood request submitted successfully",
      request,
    });
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid blood request details",
      });
    }

    return res.status(500).json({
      message: "Server error while creating blood request",
    });
  }
});



router.get("/public", async (req, res) => {
  try {
    const requests = await BloodRequest.find()
      .select("bloodGroup units city urgency status createdAt")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      count: requests.length,
      requests,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Unable to fetch public request summaries",
    });
  }
});


router.get("/", protectAdmin, async (req, res) => {
  try {
    const requests = await BloodRequest.find()
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      count: requests.length,
      requests,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while fetching blood requests",
    });
  }
});




// Update blood request status (admin only)
router.patch("/:id/status", protectAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "Pending",
      "In Progress",
      "Fulfilled",
      "Cancelled",
    ];

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid blood request ID",
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status",
        allowedStatuses,
      });
    }

    const request = await BloodRequest.findByIdAndUpdate(
      id,
      { $set: { status } },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!request) {
      return res.status(404).json({
        message: "Blood request not found",
      });
    }

    return res.status(200).json({
      message: "Blood request status updated successfully",
      request,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while updating blood request",
    });
  }
});


module.exports = router;
