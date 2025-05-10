const mongoose = require("mongoose");
const {isURL} = require("validator");
const DataProvider = require("../Models/DataProvider");
const LanguageUtils = require("../Library/Utils/LanguageUtils");

function langTagValidator(value) {
    if (!LanguageUtils.validate(value))
        return Promise.reject(
            new Error(`Invalid ICU locale language tag : ${value}`)
        );
}

function links_validator(links) {
    const set = new Set();

    for (const link of links) {
        if (!link.source)
            return Promise.reject(new Error(`Link source is required!`));
        if (set.has(link.source))
            return Promise.reject(
                new Error(`Duplicate link source '${link.source}'`)
            );

        if (!isURL(link.url))
            return Promise.reject(new Error(`Invalid link url '${link.url}'`));
        set.add(link.source);
    }

    return true;
}

const Text = new mongoose.Schema(
    {
        _id: {type: String, trim: true,},
        title: {type: String, required: true, trim: true},
        text: {type: String, required: true, trim: true},
        author: {type: String, default: "unknown"},
        data_provider: {type: mongoose.Types.ObjectId, required: true},
        links: {
            type: [
                {
                    source: {type: String, required: true, trim: true,},
                    url: {
                        type: String, trim: true,
                    },
                },
            ],
            validate: {
                validator: links_validator,
            },
        },
        icu_locale_language_tag: {
            type: String,
            required: true,
            trim: true,
            validate: {
                validator: langTagValidator,
            },
        },
    },
    {timestamps: true}
);

Text.path("data_provider").validate(async (value) => {
    return DataProvider.DataProvider.exists({_id: value});
}, "Invalid Data Provider");

module.exports = Text;
