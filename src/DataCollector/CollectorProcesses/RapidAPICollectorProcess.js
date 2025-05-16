const Logger = require("../Loggers/CollectorLogger");

class RapidAPICollectorProcess {
    constructor(automatorFactory, resultProcessor, configLoader, schedulerManager) {
        this.automatorFactory = automatorFactory;
        this.resultProcessor = resultProcessor;
        this.configLoader = configLoader;
        this.schedulerManager = schedulerManager;
    }

    async execute() {
        try {
            const jobList = await this.configLoader.loadJobTypes(process.env.JOBTYPES_FILENAME);
            const keys = await this.configLoader.loadKeys(process.env.KEYS_FILENAME);

            if (!this.configLoader.validateConfiguration(jobList, keys)) {
                throw new Error("RapidAPIProcess : Invalid configuration");
            }

            const automator = this.automatorFactory.createAutomator(keys);

            const results = await automator.automate(jobList);

            if (this.schedulerManager && this.schedulerManager.scheduler) {
                const nextRun = this.schedulerManager.scheduler.getNextExecutionTime();
                Logger.info(`RapidAPIProcess : Collecting successfully finished. Next scheduled run is at: ${nextRun}`);
            }

            return await this.resultProcessor.process(results);
        } catch (error) {
            Logger.info("RapidAPIProcess : Something went wrong in collection process");
            Logger.error(error);

            if (this.schedulerManager && this.schedulerManager.scheduler) {
                const nextRun = this.schedulerManager.scheduler.getNextExecutionTime();
                Logger.info(`RapidAPIProcess : Skipping today's execution due to error. Next scheduled run is at: ${nextRun}`);
            } else {
                Logger.info("RapidAPIProcess : Skipping today's execution due to error. Waiting for next scheduled run.");
            }

            throw error;
        }
    }
}

module.exports = RapidAPICollectorProcess;
