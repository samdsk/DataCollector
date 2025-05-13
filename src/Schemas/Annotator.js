const mongoose = require("mongoose");

const Role = require("../Models/Role");
const Background = require("../Models/Background");

const Annotator = new mongoose.Schema(
    {
        _id: {type: String, trim: true},
        role: {
            type: mongoose.Types.ObjectId,
            required: true,
            ref: "Role",
        },
        background: {
            type: mongoose.Types.ObjectId,
            required: true,
            ref: "Background",
        },
        isHuman: {type: Boolean, required: true},
    },
    {timestamps: true}
);

Annotator.path("role").validate(async (value) => {
    return Role.Role.exists({_id: value});
}, "Invalid Role");

Annotator.path("background").validate(async (value) => {
    return Background.Background.exists({_id: value});
}, "Invalid Background");

module.exports = Annotator;
