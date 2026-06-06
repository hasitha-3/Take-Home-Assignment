import express from "express";
import bcrypt from "bcrypt";
import { body, validationResult } from "express-validator";
import User from "../database/userdata.js";

const router = express.Router();
const SALT_ROUNDS = 12;

const validate = [
  body("firstname").trim().notEmpty().withMessage("First name is required"),
  body("lastname").trim().notEmpty().withMessage("Last name is required"),
  body("Email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),
  body("contact_number")
    .trim()
    .matches(/^\d{10}$/)
    .withMessage("Contact number must be 10 digits"),
  body("age")
    .isInt({ min: 1, max: 120 })
    .withMessage("Age must be between 1 and 120"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

router.post("/", validate, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(422)
      .json({ message: errors.array()[0].msg, errors: errors.array() });
  }

  try {
    // Support both wrapped (legacy) and flat body formats
    const body = req.body.userdata || req.body;
    const {
      firstname,
      lastname,
      Email,
      contact_number,
      age,
      password,
      address,
      city,
    } = body;

    // Check existing
    const existing = await User.findOne({
      $or: [
        { Email: { $regex: `^${Email}$`, $options: "i" } },
        { contact_number },
      ],
    });

    if (existing) {
      return res
        .status(400)
        .json({ message: "Email or phone number already registered." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = new User({
      firstname,
      lastname,
      Email,
      contact_number,
      age,
      password: hashedPassword,
      address: address || "",
      city: city || "",
    });

    await newUser.save();

    res.status(201).json({
      message: "Account created successfully",
      userId: newUser._id,
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
