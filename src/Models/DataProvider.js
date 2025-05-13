const mongoose = require("mongoose");

const DataProvider = require("../Schemas/DataProvider");

module.exports.DataProvider = mongoose.model("DataProvider", DataProvider);
