const mongoose = require("mongoose");

const studentSchema = mongoose.Schema({
    name: { type: String, required: true },
    dob: { type: Date, required: true },
    email: { type: String, required: true },
    highestEdQual: { type: String, required: true },
    contactNum: {type: String, required: true},
    city: { type: String, required: true },
    image: { data: Buffer, contentType: String, default: "" },
    awardsNRecog: { type: String, required: false },
    workExp: { type: String, required: false },
    volunteerExp: { type: String, required: false },
    password: { type: String, required: true },
    userType: { type: String, default: "STUDENT" },
    created: { type: Date, default: Date.now },
    mentorships: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Mentorship"
    }],
    internships: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Internship"
    }],
    volunteerships: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Volunteership"
    }],
    cv_builder: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "CV_Builder"
    }]
});

module.exports = mongoose.model("Student", studentSchema);