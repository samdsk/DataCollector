const Logger = require("./src/DataCollector/Loggers/MasterProcessLogger")
const ProcessManager = require("./src/Processes/ProcessManager");

class Application {
    constructor() {
        this.processManager = new ProcessManager();
    }

    async start() {
        try {
            await this.processManager.initialize();
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


