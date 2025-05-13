const Logger = require("../DataCollector/Loggers/MasterProcessLogger")

class MessageRouter {
    constructor() {
        this.processes = new Map();
        this.handleMessage = this.handleMessage.bind(this);
    }

    registerProcess(name, process) {
        this.processes.set(name, process);
    }

    handleMessage(msg, fromProcess) {
        if (msg.to && this.processes.has(msg.to)) {
            Logger.info(`Relaying message from ${msg.from || fromProcess} to ${msg.to}: ${msg.code}`);

            if (fromProcess !== msg.to) {
                try {
                    const success = this.processes.get(msg.to).sendMessage(msg);
                } catch (error) {
                    Logger.error(`Failed to relay message: ${error.message}`);
                }
            }
        }
    }
}

module.exports = MessageRouter;