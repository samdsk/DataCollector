const mongoose = require("mongoose");

const Domain = new mongoose.Schema(
    {
        domain: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            collation: {locale: 'en', strength: 2}
        },
    },
    {timestamps: true}
);

module.exports = Domain;
