const mongoose = require("mongoose");

const Background = require("../Schemas/Background");

module.exports.Background = mongoose.model("Background", Background);
