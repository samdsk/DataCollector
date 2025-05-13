const mongoose = require("mongoose");

const Annotator = require("../Schemas/Annotator");

module.exports.Annotator = mongoose.model("Annotator", Annotator);
