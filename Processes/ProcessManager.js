const Logger = require("../Library/Loggers/MasterProcessLogger");
const {ProcessTypes} = require("./ProcessConstants");
const MessageRouter = require("./MessageRouter");
const ProcessFactory = require("./ProcessFactory");

class ProcessManager {
    constructor() {
        this.messageRouter = new MessageRouter();
        this.processes = new Map();
    }

    async initialize() {
        Logger.info(`Started MasterProcess with pid ${process.ppid}`);

        // Initialize system
        for (const [processType, config] of Object.entries(ProcessTypes)) {
            Logger.info(`Creating process: ${config.name}`);
            const process = ProcessFactory.createProcess(processType);

            if (!process) {
                throw new Error(`Failed to create process ${config.name}`);
            }

            process.setMessageHandler(this.messageRouter);

            Logger.info(`Starting process: ${config.name}`);
            const childProcess = process.start();

            Logger.info(`Registering process: ${config.name}`);
            this.processes.set(config.name, process);
            this.messageRouter.registerProcess(config.name, process);
        }
    }

    async testMessageRouting() {
        Logger.info('=== TESTING MESSAGE ROUTING START ===');

        return new Promise((resolve) => {
            const timeout = setTimeout(() => {
                Logger.error('Message routing test timed out');
                resolve(false);
            }, 5000);

            let messageRelayed = false;
            let testCompleted = false;

            // Set up special global handler
            const detectMessageRelay = (msg) => {
                Logger.debug(`Message relay detector: ${JSON.stringify(msg)}`);

                if (testCompleted) return;

                // If we see a message from SERVER to COLLECTOR or COLLECTOR to SERVER
                if ((msg.from === ProcessTypes.SERVER.name && msg.to === ProcessTypes.COLLECTOR.name) || (msg.from === ProcessTypes.COLLECTOR.name && msg.to === ProcessTypes.SERVER.name)) {

                    messageRelayed = true;
                    testCompleted = true;

                    Logger.info('Detected message relay between processes!');

                    setTimeout(() => {
                        clearTimeout(timeout);
                        Logger.info('=== TESTING MESSAGE ROUTING END ===');
                        resolve(true);
                    }, 500);
                }
            };

            // Override MessageRouter.handleMessage temporarily
            const originalHandleMessage = this.messageRouter.handleMessage;
            this.messageRouter.handleMessage = function (msg, fromProcess) {
                originalHandleMessage.call(this, msg, fromProcess);
                detectMessageRelay(msg);
            };

            // Send a test message to SERVER
            this.processes.get(ProcessTypes.SERVER.name).sendMessage({
                from: 'MAIN', to: ProcessTypes.SERVER.name, code: 'SEND_TEST_TO_COLLECTOR'
            });

            // After test, restore original handler
            setTimeout(() => {
                this.messageRouter.handleMessage = originalHandleMessage;

                if (!messageRelayed) {
                    Logger.error('No message relay detected');
                    clearTimeout(timeout);
                    resolve(false);
                }
            }, 4500);
        });
    }


    async shutdown() {
        for (const process of this.processes.values()) {
            process.process.kill();
        }
    }
}

module.exports = ProcessManager;