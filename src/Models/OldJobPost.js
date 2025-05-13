const mongoose = require("mongoose");
const {isURL} = require("validator");

function links_validator(links) {
    if (!Array.isArray(links))
        return Promise.reject(
            new Error("Links must be an array with a source and an url!")
        );
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

const JobPost = new mongoose.Schema(
    {
        _id: {type: String},
        job_type: {type: String, required: true},
        title: {type: String, required: true},
        company: {type: String, required: true},
        location: {type: String, required: true},
        employment_type: {type: String, default: ""},
        description: {type: String, required: true},
        links: {
            type: [
                {
                    source: {type: String, required: true},
                    url: {
                        type: String,
                    },
                },
            ],
            validate: {
                validator: links_validator,
            },
        },
    },
    {timestamps: true}
);

module.exports = mongoose.model("OldJobPost", JobPost);
