const mongoose = require("mongoose");

const volunteershipSchema = mongoose.Schema({
    volunteership_opportunity: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "VolunteershipOpportunity"
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

module.exports = mongoose.model("Volunteership", volunteershipSchema);