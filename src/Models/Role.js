const mongoose = require("mongoose");

const Role = require("../Schemas/Role");

module.exports.Role = mongoose.model("Role", Role);
