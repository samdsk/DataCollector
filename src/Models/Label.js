const mongoose = require("mongoose");

const Label = require("../Schemas/Label");

module.exports.Label = mongoose.model("Label", Label);
