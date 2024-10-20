const mongoose = require("mongoose");

const Collection = require("../Schemas/Collection");

module.exports.Collection = mongoose.model("Collection", Collection);
