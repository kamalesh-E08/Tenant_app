// routes/tenantRoutes.js
const express = require("express");
const Room = require("../models/roomSchema");
const authenticateJWT = require("../middleware/authenticateJWT");

const router = express.Router();

// Get tenant's assigned room and details
router.get("/room", authenticateJWT, async (req, res) => {
    try {
        const userEmail = req.user.email;
        const room = await Room.findOne({ "members.email": userEmail });

        if (!room) return res.status(404).json({ message: "Room not assigned" });

        const member = room.members.find((m) => m.email === userEmail);
        const admin = room.userId;

        res.status(200).json({
            roomName: room.name,
            yourDetails: member,
            roommates: room.members.filter((m) => m.email !== userEmail),
            adminId: admin,
            faults: room.faults,
        });
    } catch (err) {
        res.status(500).json({ message: "Error fetching tenant details", error: err });
    }
});

module.exports = router;
