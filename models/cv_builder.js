const mongoose = require("mongoose");

const cv_builderSchema = mongoose.Schema({
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

module.exports = mongoose.model("CV_Builder", cv_builderSchema); 