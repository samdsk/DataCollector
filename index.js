const Logger = require("./src/Library/Loggers/MasterProcessLogger")
const ProcessManager = require("./src/Processes/ProcessManager");

class Application {
    constructor() {
        this.processManager = new ProcessManager();
    }

    async start() {
        try {
            await this.processManager.initialize();

            // Logger.info('Testing message routing between processes...');
            // const routingWorks = await this.processManager.testMessageRouting();
            //
            // if (!routingWorks) {
            //     Logger.warn('Message routing test failed - system may not function properly');
            // } else {
            //     Logger.info('Message routing test successful!');
            // }

        } catch (error) {
            Logger.error(error);
            await this.shutdown();
        }
    }

    async shutdown() {
        await this.processManager.shutdown();
        process.exit(1);
    }
}

(async () => {
    try {
        const app = new Application();
        await app.start();
    } catch (e) {
        Logger.error(e);
        process.exit(1);
    }
})();


