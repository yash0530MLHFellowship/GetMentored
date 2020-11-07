const mongoose = require("mongoose");

const communitySchema = mongoose.Schema({
    title: String,
    text: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student"
        },
        name: String
    },
    image: { data: Buffer, contentType: String, default: "" },
    city: String,
    status: { type: Boolean, default: false },
    comments: [{
        text: String,
        author: {
            id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Student"
            },
            name: String
        },
        created: { type: Date, default: Date.now }
    }],
    created: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Community", communitySchema);