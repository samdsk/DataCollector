const winston = require("winston");
const getOptions = require('./LoggingOptions')

module.exports = winston.createLogger(getOptions("Server"));
