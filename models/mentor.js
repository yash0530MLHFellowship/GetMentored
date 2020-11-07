const mongoose = require("mongoose");

const mentorSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    contactNum: { type: String, required: true },
    userType: { type: String, default: "MENTOR" },
    image: { data: Buffer, contentType: String, default: "" },
    quote: { type: String, required: true },
    workExp: { type: String, required: true },
    city: { type: String, required: true },
    industry: { type: String, required: true },
    reviews: [{
        text: { type: String, required: true },
        author: {
            id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Student'
            },
            name: String
        },
        created: { type: Date, default: Date.now, required: true },
    }],
    created: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Mentor", mentorSchema);