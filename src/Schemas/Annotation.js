const mongoose = require("mongoose");
const Text = require("../Models/Text");
const Annotator = require("../Models/Annotator");
const Label = require("../Models/Label");
const Domain = require("../Models/Domain");

const Annotation = new mongoose.Schema(
    {
        text: {
            type: String,
            required: true,
            ref: "Text",
            trim: true
        },
        annotator: {
            type: String,
            required: true,
            ref: "Annotator",
            trim: true
        },
        label: {
            type: mongoose.Types.ObjectId,
            required: true,
            ref: "Label",
        },
        reason: {
            type: String,
            required: true,
            trim: true
        },
        domain: {
            type: mongoose.Types.ObjectId,
            ref: "Domain",
        },
        tokens: {
            type: [String],
            required: true,
            validator: (v) => Array.isArray(v),
        },
        tokenString: {type: String}
    },
    {timestamps: true}
);

Annotation.pre("save", function (next) {
    if (this.isModified('tokens')) {
        this.tokens.sort();
        this.tokenString = this.tokens.join(',');
    }

    next();
})

Annotation.index(
    {text: 1, annotator: 1, label: 1, domain: 1, reason: 1, tokenString: 1},
    {unique: true}
);

Annotation.path("text").validate(async (value) => {
    return Text.Text.exists({_id: value});
}, "Invalid Text");

Annotation.path("tokens").validate(async (value) => {
    return Array.isArray(value);
}, "Invalid Tokens object");

Annotation.path("annotator").validate(async (value) => {
    return Annotator.Annotator.exists({_id: value});
}, "Invalid Annotator");

Annotation.path("label").validate(async (value) => {
    return Label.Label.exists({_id: value});
}, "Invalid Label");

Annotation.path("domain").validate(async (value) => {
    return Domain.Domain.exists({_id: value});
}, "Invalid Domain");

Annotation.post(["find", "findOne", "findById", "save", "update"], function (documents) {
    if (Array.isArray(documents)) {
        documents.forEach((doc) => {
            doc.tokenString = undefined
        })
    } else if (documents) {
        documents.tokenString = undefined
    }
})

module.exports = Annotation;
