const mongoose = require("mongoose");

const Background = new mongoose.Schema(
    {
        background: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            collation: {locale: 'en', strength: 2}
        },
    },
    {timestamps: true}
);

module.exports = Background;
