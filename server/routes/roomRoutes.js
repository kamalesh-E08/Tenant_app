// routes/roomRoutes.js
const express = require("express");
const Room = require("../models/roomSchema");
const authenticateJWT = require("../middleware/authenticateJWT");
// const transporter = require("../utils/emailTransporter");

const router = express.Router();

const sendRoomAssignmentEmail = (adminEmail, tenantEmail, roomName, memberName, rentAmount) => {
    const mailOptions = {
        from: adminEmail,
        to: tenantEmail,
        subject: "Room Assignment Confirmation",
        text: `You have been assigned to room ${roomName} as ${memberName}. Rent Amount: ₹${rentAmount}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("Error sending email:", error);
        } else {
            console.log("Email sent:", info.response);
        }
    });
};

router.post("/", authenticateJWT, async (req, res) => {
    const { name } = req.body;
    const userId = req.user.userId;

    const existingRoom = await Room.findOne({ name, admin: req.user.id });
    if (existingRoom) {
        return res.status(400).json({ message: "Room already exists for this admin." });
    }

    try {
        const newRoom = new Room({ userId, name, members: [], faults: [] });
        await newRoom.save();
        res.status(201).json(newRoom);
    } catch (err) {
        res.status(500).json({ message: "Error creating room", error: err });
    }
});

router.get("/", authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.userId;
        const rooms = await Room.find({ userId });
        res.status(200).json(rooms);
    } catch (err) {
        res.status(500).json({ message: "Error fetching rooms", error: err });
    }
});

router.post("/:id/members", authenticateJWT, async (req, res) => {
    const { id } = req.params;
    const { email, name, rentAmount } = req.body;
    const adminEmail = req.user.email;

    try {
        const room = await Room.findById(id);
        if (!room) return res.status(404).json({ message: "Room not found" });

        const duplicateMember = room.members.find(
            (member) => member.email.toLowerCase() === email.toLowerCase()
        );

        if (duplicateMember) {
            return res.status(400).json({ message: "Email already exists in this room." });
        }

        room.members.push({ name, email, rentAmount, rentDue: true });
        await room.save();

        // sendRoomAssignmentEmail(adminEmail, email, room.name, name, rentAmount);

        res.status(200).json(room);
    } catch (err) {
        console.error("Add Member Error:", err);
        res.status(500).json({ message: "Error adding member", error: err });
    }
});

router.delete("/:id", authenticateJWT, async (req, res) => {
    try {
        const deletedRoom = await Room.findByIdAndDelete(req.params.id);
        if (!deletedRoom) return res.status(404).json({ message: "Room not found" });

        res.status(200).json({ message: "Room deleted successfully", deletedRoom });
    } catch (err) {
        res.status(500).json({ message: "Error deleting room", error: err });
    }
});

router.delete("/:id/members/:memberId", authenticateJWT, async (req, res) => {
    const { id, memberId } = req.params;
    try {
        const updatedRoom = await Room.findByIdAndUpdate(
            id,
            { $pull: { members: { _id: memberId } } },
            { new: true }
        );

        if (!updatedRoom) return res.status(404).json({ message: "Room not found" });

        res.status(200).json(updatedRoom);
    } catch (err) {
        res.status(500).json({ message: "Error removing member", error: err });
    }
});

router.post("/:id/rent-reminder", authenticateJWT, async (req, res) => {
    const { id } = req.params;
    const { message } = req.body;

    try {
        const room = await Room.findById(id);
        if (!room) return res.status(404).json({ message: "Room not found" });

        const reminders = room.members.map((member) => ({
            memberName: member.name,
            personalizedMessage: `${message || "Please pay your rent soon!"} Amount due: ₹${member.rentAmount}`,
        }));

        res.status(200).json(reminders);
    } catch (err) {
        res.status(500).json({ message: "Error sending reminders", error: err });
    }
});

module.exports = router;
