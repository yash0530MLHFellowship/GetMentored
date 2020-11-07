const mongoose = require("mongoose");

const volunteershipOpportunitySchema = mongoose.Schema({
    org_name: { type: String },
    org_logo: { data: Buffer, contentType: String, default: "" },
    profile: { type: String },
    cities: { type: String },
    link: {type:String},
    short_description: { type: String },
    description: { type: String },
    duration: { type: String },
    openings_left: { type: Number, default: 1 },
    created: { type: Date, default: Date.now }
});

module.exports = mongoose.model("VolunteershipOpportunity", volunteershipOpportunitySchema);