const mongoose = require("mongoose");

const DataProvider = new mongoose.Schema(
    {
        data_provider: {
            type: String,
            required: true,
            trim: true,
            collation: {locale: 'en', strength: 2}
        },
    },
    {timestamps: true}
);

DataProvider.index({data_provider: 1}, {unique: true});

module.exports = DataProvider;
