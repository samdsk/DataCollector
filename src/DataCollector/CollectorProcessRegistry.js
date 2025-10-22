const Logger = require("./Loggers/CollectorLogger");
const CollectorRunConfig = require("./ConfigLoaders/CollectorRunConfig");

class CollectorProcessRegistry {
    constructor() {
        this.processes = [];
        this.config = new CollectorRunConfig();
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
        this.reloadConfig();

        const enabledProcesses = this.processes.filter(process => {
            const isEnabled = this.config.isEnabled(process.constructor.name);
            if (!isEnabled) {
                Logger.info(`Skipping disabled process: ${process.constructor.name}`);
            }
            return isEnabled;
        });

        Logger.info(`Executing ${enabledProcesses.length} enabled processes (${this.processes.length - enabledProcesses.length} skipped)`);
        const results = [];

        for (const process of enabledProcesses) {
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

    reloadConfig() {
        this.config.reloadConfig();
        Logger.info('Configuration reloaded');
    }

    getProcessStatus() {
        return this.processes.map(process => ({
            name: process.constructor.name,
            enabled: this.config.isEnabled(process.constructor.name)
        }));
    }
}


module.exports = CollectorProcessRegistry;