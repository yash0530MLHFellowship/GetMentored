const mongoose = require("mongoose");

const adminSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    userType: {type: String, default: "ADMIN" },
    created: { type: Date, default: Date.now }
});

module.exports = mongoose.model("admin", adminSchema);