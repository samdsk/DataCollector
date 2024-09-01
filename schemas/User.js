const mongoose = require("mongoose");
const USER_TYPES = ["Admin", "AnnotationService", "LLM"]
const validator = require('validator');

const User = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            validate: {
                validator: validator.isEmail
            }
        },
        password: {
            type: String,
            required: true,
            min: 6,
        },
        userType: {
            type: String,
            required: true,
            enum: USER_TYPES
        }
    },
    {timestamps: true}
);

User.index({email: 1}, {unique: true});

module.exports = {User, USER_TYPES};
