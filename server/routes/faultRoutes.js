const express = require("express");
const Room = require("../models/roomSchema");
const authenticateJWT = require("../middleware/authenticateJWT");

const router = express.Router();

router.post("/:roomId/faults", authenticateJWT, async (req, res) => {
    const { roomId } = req.params;
    const { description, status = "Pending" } = req.body;

    try {
        const room = await Room.findById(roomId);
        if (!room) return res.status(404).json({ message: "Room not found" });

        const fault = { description, status, createdAt: new Date() };
        room.faults.push(fault);
        await room.save();

        res.status(201).json({ message: "Fault reported successfully", faults: room.faults });
    } catch (err) {
        res.status(500).json({ message: "Error reporting fault", error: err });
    }
});

router.put("/:roomId/faults/:faultId", authenticateJWT, async (req, res) => {
    const { roomId, faultId } = req.params;
    const { description, status } = req.body;

    try {
        const room = await Room.findById(roomId);
        if (!room) return res.status(404).json({ message: "Room not found" });

        const fault = room.faults.id(faultId);
        if (!fault) return res.status(404).json({ message: "Fault not found" });

        if (description) fault.description = description;
        if (status) fault.status = status;

        await room.save();
        res.status(200).json({ message: "Fault updated successfully", faults: room.faults });
    } catch (err) {
        res.status(500).json({ message: "Error updating fault", error: err });
    }
});

router.get("/:roomId/faults", authenticateJWT, async (req, res) => {
    const { roomId } = req.params;
    console.log("Fetching faults for room:", req.params);
    try {
        const room = await Room.findById(roomId);
        if (!room) return res.status(404).json({ message: "Room not found" });

        res.status(200).json(room.faults);
    } catch (err) {
        res.status(500).json({ message: "Error fetching faults", error: err });
    }
});

router.delete('/:roomId/faults/:faultId', authenticateJWT, async (req, res) => {
    const { roomId, faultId } = req.params;
  
    try {
      const room = await Room.findById(roomId);
      if (!room) return res.status(404).json({ message: 'Room not found' });
  
      const faultIndex = room.faults.findIndex(fault => fault._id.toString() === faultId);
      if (faultIndex === -1) {
        return res.status(404).json({ message: 'Fault not found' });
      }
      room.faults.splice(faultIndex, 1);
      await room.save();
  
      res.json({ message: 'Fault deleted successfully', faults: room.faults });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  });
  

module.exports = router;
