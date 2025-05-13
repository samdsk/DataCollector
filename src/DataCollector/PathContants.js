const path = require('path');

const ROOT_DIR = process.cwd();

module.exports = {
    ROOT_DIR,
    LOGS_DIR: path.join(ROOT_DIR, "logs", process.env.NODE_ENV || "dev"),
    RESULTS_DIR: path.join(ROOT_DIR, "results"),
    CONFIG_DIR: path.join(ROOT_DIR, "config"),
};