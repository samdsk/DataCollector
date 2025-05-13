const mongoose = require("mongoose");

const Text = require("../Schemas/Text");

module.exports.Text = mongoose.model("Text", Text);
