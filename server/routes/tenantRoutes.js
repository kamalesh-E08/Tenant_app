const express = require("express");
const Room = require("../models/roomSchema");
const authenticateJWT = require("../middleware/authenticateJWT");

const router = express.Router();

router.get("/tenant-info/:email", authenticateJWT, async (req, res) => {
    let { email } = req.params;
    email = email.toLowerCase();
    try {
        const room = await Room.findOne({ "members.email": email }).populate("userId", "name email");
        console.log("Room found:", room);
        if (!room) return res.status(404).json({ message: "Not Found" });

        const tenant = room.members.find(member => member.email === email);

        if (!tenant) return res.status(404).json({ message: "Tenant not found in the room members list." });
       
        const roommates = room.members.filter(member => member.email !== email);
        const faults = room.faults;

        res.status(200).json({
            tenant,
            roommates,
            admin: room.userId,
            faults,
            roomId: room._id,
        });

    } catch (err) {
        console.error("Error fetching tenant info:", err);
        res.status(500).json({ message: "Server error", error: err });
    }
});


module.exports = router;
