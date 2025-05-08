const {createProcess} = require("./ProcessFactory");
const MessageRouter = require("./MessageRouter");
const Logger = require("../Loggers/MasterProcessLogger")
const {ProcessTypes} = require("./ProcessConstants");

class ProcessManager {
    constructor() {
        this.messageRouter = new MessageRouter();
        this.processes = new Map();
    }

    async initialize() {
        Logger.info(`Started MasterProcess with pid ${process.ppid}`);

        for (const [processType, config] of Object.entries(ProcessTypes)) {
            const process = createProcess(processType);
            process.setMessageHandler(this.messageRouter);

            const childProcess = process.start();
            this.processes.set(config.name, process);
            this.messageRouter.registerProcess(config.name, process);
        }
    }

    async shutdown() {
        for (const process of this.processes.values()) {
            process.process.kill();
        }
    }
}

module.exports = ProcessManager;