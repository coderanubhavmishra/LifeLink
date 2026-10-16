
const express = require("express");
const Donor = require("../models/Donor");
const rateLimit = require("express-rate-limit");
const protectAdmin = require("../middleware/authMiddleware");
const router = express.Router();
const donorRegistrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5,                  // Maximum 5 attempts
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many registration attempts. Please try again later.",
  },
});

// 1. Register a new donor
router.post("/",donorRegistrationLimiter, async (req, res) => {
  try {
    const { name, age, bloodGroup, phone, city } = req.body;

if (
  typeof name !== "string" ||
  name.trim().length < 2 ||
  name.trim().length > 80
) {
  return res.status(400).json({
    message: "Name must contain 2 to 80 characters",
  });
}

if (
  age === undefined ||
  age === null ||
  age === "" ||
  !Number.isInteger(Number(age)) ||
  Number(age) < 18 ||
  Number(age) > 65
) {
  return res.status(400).json({
    message: "Age must be a whole number between 18 and 65",
  });
}

const allowedBloodGroups = [
  "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-",
];

if (!allowedBloodGroups.includes(bloodGroup)) {
  return res.status(400).json({
    message: "Invalid blood group",
  });
}

if (typeof phone !== "string" || !/^[0-9]{10}$/.test(phone.trim())) {
  return res.status(400).json({
    message: "Phone number must contain exactly 10 digits",
  });
}

if (
  typeof city !== "string" ||
  city.trim().length < 2 ||
  city.trim().length > 100
) {
  return res.status(400).json({
    message: "City must contain 2 to 100 characters",
  });
}

    const donor = await Donor.create({
      name: name.trim(),
  age: Number(age),
  bloodGroup,
  phone: phone.trim(),
  city: city.trim(),
    });

    res.status(201).json({
      message: "Donor registered successfully",
      donor,
    });
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid donor details",
        error: error.message,
      });
    }

    res.status(500).json({
      message: "Server error while registering donor",
    });
  }
});

// 2. Get all donors and optionally search by blood group and city
router.get("/", async (req, res) => {
  try {
    const { bloodGroup, city } = req.query;
    const filter = {};

    if (bloodGroup) {
      filter.bloodGroup = bloodGroup;
    }

    if (city) {
      filter.city = { $regex: city, $options: "i" };
    }
    const donors = await Donor.find(filter).select("name age bloodGroup city available createdAt").sort({ createdAt: -1 }).lean();
    
    res.status(200).json({
      count: donors.length,
      donors,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error while fetching donors",
    });
  }
});
// Update donor availability (admin only)
router.patch("/:id/availability", protectAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { available } = req.body;

    if (!require("mongoose").isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid donor ID",
      });
    }

    if (typeof available !== "boolean") {
      return res.status(400).json({
        message: "Availability must be true or false",
      });
    }

    const donor = await Donor.findByIdAndUpdate(
      id,
      { $set: { available } },
      { new: true, runValidators: true }
    ).select("name age bloodGroup city available");

    if (!donor) {
      return res.status(404).json({
        message: "Donor not found",
      });
    }

    return res.status(200).json({
      message: "Donor availability updated successfully",
      donor,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while updating donor availability",
    });
  }
});

module.exports = router;
