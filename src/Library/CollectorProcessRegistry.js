const Logger = require("./Loggers/CollectorLogger");


class CollectorProcessRegistry {
    constructor() {
        this.processes = [];
    }

    register(process) {
        if (typeof process.execute !== 'function') {
            throw new Error('Process must have an execute method');
        }
        this.processes.push(process);
        Logger.info(`Registered process: ${process.constructor.name}`);
        return this;
    }

    async executeAll() {
        Logger.info(`Executing ${this.processes.length} registered processes`);
        const results = [];

        for (const process of this.processes) {
            try {
                Logger.info(`Executing process: ${process.constructor.name}`);
                const result = await process.execute();
                results.push({
                    process: process.constructor.name,
                    success: true,
                    result
                });
            } catch (error) {
                Logger.error(`Error executing process ${process.constructor.name}: ${error.message}`);
                results.push({
                    process: process.constructor.name,
                    success: false,
                    error: error.message
                });
            }
        }

        return results;
    }
}


module.exports = CollectorProcessRegistry;