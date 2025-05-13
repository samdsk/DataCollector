const mongoose = require("mongoose");
const {isURL} = require("validator");
const {Text} = require("../Models/Text");

const Collection = new mongoose.Schema(
    {
        collection_name: {
            type: String,
            required: true,
            trim: true,
            collation: {locale: 'en', strength: 2}
        },
        texts: {type: [String], ref: "Text", validate: {validator: text_validator}, default: []},
    },
    {timestamps: true}
);

Collection.index({collection_name: 1}, {unique: true});

async function text_validator(texts) {
    if (!Array.isArray(texts))
        return false

    const set = new Set();

    for (const text of texts) {
        const found = await Text.exists({_id: text});
        if (!found)
            return Promise.reject(new Error(`Invalid text: ${text}!`));
        if (set.has(text))
            return Promise.reject(
                new Error(`Duplicate text '${text}'`)
            );

        set.add(text);
    }

    return true;
}


module.exports = Collection;
