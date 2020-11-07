const mongoose = require("mongoose");

const mentorshipSchema = mongoose.Schema({
    mentor: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Mentor"
        },
        name: String
    },
    student: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student"
        },
        name: String
    },
    status: { type: Number, default: 0 },
    created: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Mentorship", mentorshipSchema);