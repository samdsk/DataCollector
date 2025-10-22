const fs = require('fs');
const path = require('path');
const Logger = require('../Loggers/CollectorLogger');
require("dotenv").config();

class CollectorConfig {
    constructor(configPath = process.env.COLLECTOR_RUN_CONFIG_PATH) {
        this.configPath = configPath;
        this.config = this.loadConfig();
    }

    loadConfig() {
        try {
            if (fs.existsSync(this.configPath)) {
                const configData = fs.readFileSync(this.configPath, 'utf8');
                const config = JSON.parse(configData);
                Logger.info('Collector configuration loaded successfully');
                return config;
            } else {
                Logger.warn(`Configuration file not found at ${this.configPath}, using default (all enabled)`);
                return {};
            }
        } catch (error) {
            Logger.error(`Error loading collector configuration: ${error.message}`);
            return {};
        }
    }

    isEnabled(processName) {
        return this.config[processName] !== false;
    }

    reloadConfig() {
        this.config = this.loadConfig();
    }

    getConfig() {
        return { ...this.config };
    }
}

module.exports = CollectorConfig;