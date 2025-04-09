const mongoose = require('mongoose'); 

const roomSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: String,
    members: [
        {
            email: String,
            name: String,
            rentDue: Boolean,
            rentAmount: Number,
        },
    ],
    faults: [
        {
          description: String,
          reportedBy: String,
          status: {
            type: String,
            enum: ["Pending", "In Progress", "Resolved"],
            default: "Pending"
          },
          updatedAt: {
            type: Date,
            default: Date.now
          }
        }
      ]
});

module.exports = mongoose.model('Room', roomSchema);