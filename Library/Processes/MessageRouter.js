const Logger = require("../Loggers/MasterProcessLogger")

class MessageRouter {
    constructor() {
        this.processes = new Map();
        this.handleMessage = this.handleMessage.bind(this);
    }

    registerProcess(name, process) {
        this.processes.set(name, process);
    }

    handleMessage(msg, fromProcess) {
        Logger.info(`MessageRouter received message from ${fromProcess || 'unknown'}: ${JSON.stringify(msg)}`);

        // Check if message has 'to' field and target exists
        if (msg.to && this.processes.has(msg.to)) {
            Logger.info(`Relaying message from ${msg.from || fromProcess} to ${msg.to}: ${msg.code}`);

            // Don't send to self
            if (fromProcess !== msg.to) {
                try {
                    const success = this.processes.get(msg.to).sendMessage(msg);
                    Logger.info(`Message relay ${success ? 'successful' : 'failed'}`);
                } catch (error) {
                    Logger.error(`Failed to relay message: ${error.message}`);
                }
            } else {
                Logger.warn(`Ignoring message to self from ${fromProcess}`);
            }
        } else if (!msg.to) {
            Logger.warn(`Message has no 'to' field: ${JSON.stringify(msg)}`);
        } else if (!this.processes.has(msg.to)) {
            Logger.warn(`Target process '${msg.to}' not found for message: ${JSON.stringify(msg)}`);
        }
    }
}

module.exports = MessageRouter;