const mongoose = require("mongoose");

const Document = new mongoose.Schema(
    {
        document_type: {
            type: String,
            trim: true,
            collation: {locale: 'en', strength: 2}
        },
        section: {
            type: String,
            trim: true,
            collation: {locale: 'en', strength: 2}
        },
        reference: [{type: mongoose.Types.ObjectId, ref: "Document"}],
    },
    {timestamps: true}
);

module.exports = Document;
