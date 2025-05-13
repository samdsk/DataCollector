const Logger = require("../DataCollector/Loggers/MasterProcessLogger")
const {fork} = require('child_process')

class ChildProcess {
    constructor(config) {
        this.config = config;
        this.process = null;
        this.messageHandler = null;
    }

    setMessageHandler(handler) {
        this.messageHandler = handler;
    }

    start() {
        this.process = fork(this.config.path);
        this.setupEventListeners();
        Logger.info(`Process ${this.config.name} started with PID: ${this.process.pid}`);
        return this.process;
    }

    setupEventListeners() {
        this.process.on("exit", this.handleExit.bind(this));
        this.process.on("error", this.handleError.bind(this));
        this.process.on("message", this.handleMessage.bind(this));
    }

    handleExit(code, signal) {
        if (code !== 0) {
            Logger.info(`Process ${this.config.name} crashed with code ${code}. Restarting...`);
            this.start();
        } else {
            Logger.info(`Process ${this.config.name} exited with code ${code}.`);
        }
    }

    handleError(error) {
        Logger.info(`ERROR: Failed to start process ${this.config.name}: ${this.process.pid}`);
        Logger.error(error);
    }

    handleMessage(msg) {
        if (this.messageHandler) {
            this.messageHandler.handleMessage(msg, this.config.name);
        }
    }

    sendMessage(message) {
        try {
            this.process.send(message);
            return true;
        } catch (error) {
            Logger.error(`Failed to send message to ${this.config.name}: ${error.message}`);
            return false;
        }
    }
}

module.exports = ChildProcess;
