console.log('File loaded:', __filename);
const Logger = require("./Library/Loggers/MasterProcessLogger")
const ProcessManager = require("./Library/Processes/ProcessManager");

class Application {
    constructor() {
        this.processManager = new ProcessManager();
    }

    async start() {  // Make start method async
        try {
            await this.processManager.initialize();

            Logger.info('Testing message routing between processes...');
            const routingWorks = await this.processManager.testMessageRouting();

            if (!routingWorks) {
                Logger.warn('Message routing test failed - system may not function properly');
            } else {
                Logger.info('Message routing test successful!');
            }

        } catch (error) {
            Logger.error(error);
            await this.shutdown();  // Await the shutdown
        }
    }

    async shutdown() {
        await this.processManager.shutdown();
        process.exit(1);
    }
}

// Main execution
(async () => {  // Make the IIFE async
    try {
        const app = new Application();
        await app.start();  // Await the start method
    } catch (e) {
        Logger.error(e);
        process.exit(1);
    }
})();


