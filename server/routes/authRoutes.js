const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/User");

const router = express.Router();
const JWT_SECRET = "qwertyuiop";

router.post("/register", async (req, res) => {
    const { email, password, role } = req.body;
    const lemail = email.toLowerCase();
    try {
        const existingUser = await User.findOne({ lemail });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists!" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ lemail, password: hashedPassword, role });
        await newUser.save();

        res.status(201).json({ message: "User registered successfully!", user: newUser });
    } catch (err) {
        res.status(500).json({ message: "Error registering user", error: err });
    }
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password!" });
        }

        const token = jwt.sign({ userId: user._id, role: user.role, email: user.email }, JWT_SECRET);
        res.status(200).json({ message: "Login successful!", token, role: user.role, email: user.email });
    } catch (err) {
        res.status(500).json({ message: "Error logging in", error: err });
    }
});

module.exports = router;
