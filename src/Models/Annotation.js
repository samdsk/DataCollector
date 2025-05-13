const mongoose = require("mongoose");
const Annotation = require("../Schemas/Annotation");

module.exports.Annotation = mongoose.model("Annotation", Annotation);
