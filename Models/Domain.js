const mongoose = require("mongoose");

const Domain = require("../Schemas/Domain");

module.exports.Domain = mongoose.model("Domain", Domain);
