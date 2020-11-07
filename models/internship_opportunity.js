const mongoose = require("mongoose");

const internshipOpportunitySchema = mongoose.Schema({
    org_name: { type: String },
    org_logo: { data: Buffer, contentType: String, default: "" },
    profile: { type: String },
    stipend: { type: String },
    city: { type: String },
    short_description: { type: String },
    description: { type: String },
    duration: { type: String },
    openings_left: { type: Number, default: 1 },
    industry: { type: String, required: true },
    created: { type: Date, default: Date.now }
});

module.exports = mongoose.model("InternshipOpportunity", internshipOpportunitySchema);