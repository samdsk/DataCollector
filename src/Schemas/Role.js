const mongoose = require("mongoose");

const Role = new mongoose.Schema(
    {
        role: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            collation: {locale: 'en', strength: 2}
        },
        reliability_score: {
            type: Number,
            required: true,
            min: [0, "reliability_score can't be negative"],
            max: [10, "reliability_score can't be grater than 10"],
        },
    },
    {timestamps: true}
);

module.exports = Role;
