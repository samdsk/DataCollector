const mongoose = require("mongoose");

const OutputLLM = new mongoose.Schema(
    {
        text_id: String,
        text: String,
        label: String,
        domain: String,
        reason: String,
        tokens: [String],
        icu_locale_language_tag: String,
    },
    {timestamps: true, autoCreate: false, autoIndex: false}
);

module.exports = OutputLLM;
