const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("./models/User");
const Room = require("./models/roomSchema");
const nodeMailer = require("nodemailer");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
app.use(express.json());
app.use(cors());

const JWT_SECRET = "qwertyuiop";

mongoose.connect("mongodb://127.0.0.1:27017/tenant_management");

const transporter = nodeMailer.createTransport({
    service: "gmail",
    auth: {
        user:"",
        pass:"",
    },
});

app.post("/register", async (req, res) => {
    const { email, password, role } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists!" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ email, password: hashedPassword, role });
        await newUser.save();

        res.status(201).json({ message: "User registered successfully!", user: newUser });
    } catch (err) {
        res.status(500).json({ message: "Error registering user", error: err });
    }
});

app.post("/login", async (req, res) => {
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

        const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET);

        res.status(200).json({ message: "Login successful!", token, role: user.role });
    } catch (err) {
        res.status(500).json({ message: "Error logging in", error: err });
    }
});

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(" ")[1];

        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) {
                return res.status(403).json({ message: "Forbidden access" });
            }
            req.user = user;
            next();
        });
    } else {
        res.status(401).json({ message: "Unauthorized access" });
    }
};

app.post("/rooms", authenticateJWT, async (req, res) => {
    const { name } = req.body;
    const userId = req.user.userId;
    try {
        const newRoom = new Room({ userId, name, members: [], faults: [] });
        await newRoom.save();

        res.status(201).json(newRoom);
    } catch (err) {
        res.status(500).json({ message: "Error creating room", error: err });
    }
});

app.get("/rooms", authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.userId;
        const rooms = await Room.find({userId});
        res.status(200).json(rooms);
    } catch (err) {
        res.status(500).json({ message: "Error fetching rooms", error: err });
    }
});

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
}

app.post("/rooms/:id/members", authenticateJWT, async (req, res) => {
    const { id } = req.params;
    const{email} = req.body;
    const { member, rentAmount } = req.body;
    const adminEmail = req.user.email;

    try {
        const room = await Room.findById(id);
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        room.members.push({ name: member, rentDue: true, rentAmount });
        await room.save();

        // sendRoomAssignmentEmail(adminEmail, email, room.name, member, rentAmount);

        res.status(200).json(room);
    } catch (err) {
        res.status(500).json({ message: "Error adding member", error: err });
    }
});


app.delete("/rooms/:id", authenticateJWT, async (req, res) => {
    const { id } = req.params;

    try {
        const deletedRoom = await Room.findByIdAndDelete(id);

        if (!deletedRoom) {
            return res.status(404).json({ message: "Room not found" });
        }

        res.status(200).json({ message: "Room deleted successfully", deletedRoom });
    } catch (err) {
        console.error("Error deleting room:", err);
        res.status(500).json({ message: "Error deleting room", error: err });
    }
});


app.delete("/rooms/:id/members/:memberId", authenticateJWT, async (req, res) => {
    const { id, memberId } = req.params;
    try {
        const updatedRoom = await Room.findByIdAndUpdate(
            id,
            { $pull: { members: { _id: memberId } } },
            { new: true }
        );

        if (!updatedRoom) {
            return res.status(404).json({ message: "Room not found" });
        }

        res.status(200).json(updatedRoom);
    } catch (err) {
        console.error("Error removing member:", err);
        res.status(500).json({ message: "Error removing member", error: err });
    }
});


app.post("/rooms/:id/rent-reminder", authenticateJWT, async (req, res) => {
    const { id } = req.params;
    const { message } = req.body;

    try {
        const room = await Room.findById(id);
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        const reminders = room.members.map((member) => ({
            memberName: member.name,
            personalizedMessage: `${message || "Please pay your rent soon!"} Amount due: ₹${member.rentAmount}`,
        }));

        res.status(200).json(reminders);
    } catch (err) {
        res.status(500).json({ message: "Error sending reminders", error: err });
    }
});

app.get("/tenant-room", authenticateJWT, async (req, res) => {
    const room = await Room.findOne({ "members.name": req.user.email });
    if (!room) return res.status(404).json({ message: "Room not found" });
  
    res.status(200).json({ room: room.name, roommates: room.members });
  });

app.post("/rooms/:id/faults", authenticateJWT, async (req, res) => {
const { id } = req.params;
const { description } = req.body;

const room = await Room.findById(id);
if (!room) return res.status(404).json({ message: "Room not found" });

room.faults.push({ description, reportedBy: req.user.email });
await room.save();
res.status(200).json(room);
});
  

app.listen(8000, () => {
    console.log("Server running on http://localhost:8000");
});
