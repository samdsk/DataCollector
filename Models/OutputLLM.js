const mongoose = require("mongoose");

const OutputLLM = require(`../Schemas/OutputLLM`);

module.exports = mongoose.model("OutputLLM", OutputLLM);
