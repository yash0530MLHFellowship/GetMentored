const mongoose = require("mongoose");

const industrySchema = mongoose.Schema({
    name: { type: String, required: true },
    image: { data: Buffer, contentType: String, default: "" },
    mentors: { type: Number, default: 0 },
    internship_opportunities: { type: Number, default: 0 }
});

module.exports = mongoose.model("Industry", industrySchema);