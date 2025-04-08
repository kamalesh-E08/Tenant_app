const mongoose = require('mongoose'); 

const roomSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: String,
    members: [
        {
            name: String,
            rentDue: Boolean,
            rentAmount: Number,
        },
    ],
    faults: [
        {
            description: String,
            reportedBy: String,
            status: { type: String, default: "Pending" },
        },
    ],
});

module.exports = mongoose.model('Room', roomSchema);