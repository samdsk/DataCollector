const mongoose = require("mongoose");

const {
    User,
    USER_TYPES
} = require("../Schemas/User");

module.exports.User = mongoose.model("User", User);
module.exports.USER_TYPES = Array.from(USER_TYPES);