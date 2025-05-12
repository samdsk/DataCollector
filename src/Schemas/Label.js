const mongoose = require("mongoose");

const Label = new mongoose.Schema(
    {
        label: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            collation: {locale: 'en', strength: 2}
        },
    },
    {timestamps: true}
);

module.exports = Label;
