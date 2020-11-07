const mongoose = require("mongoose");

const internshipSchema = mongoose.Schema({
    internship_opportunity: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "InternshipOpportunity"
        },
        short_description: { type: String }
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

module.exports = mongoose.model("Internship", internshipSchema);