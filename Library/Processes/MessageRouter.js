const Logger = require("../Loggers/MasterProcessLogger")

class MessageRouter {
    constructor() {
        this.processes = new Map();
    }

    registerProcess(name, process) {
        this.processes.set(name, process);
    }

    handleMessage(msg, fromProcess) {
        if (msg.to && this.processes.has(msg.to)) {
            Logger.info(`Relaying message from ${msg.from} to ${msg.to}: ${msg.code}`);
            if (fromProcess !== msg.to) {
                this.processes.get(msg.to).sendMessage(msg);
            }
        }
    }
}

module.exports = MessageRouter;