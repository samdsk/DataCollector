const Logger = require("../Loggers/CollectorLogger");
const AdzunaRequestSender = require("../RequestSenders/AdzunaRequestSender");

class AdzunaCollectorProcess {
    constructor(automatorFactory, resultProcessor, configLoader, schedulerManager) {
        this.automatorFactory = automatorFactory;
        this.resultProcessor = resultProcessor;
        this.configLoader = configLoader;
        this.schedulerManager = schedulerManager;
    }

    async execute() {
        try {
            const jobList = await this.configLoader.loadJobTypes(process.env.ADZUNA_JOBTYPES_FILENAME);
            const keys = await this.configLoader.loadKeys(process.env.ADZUNA_KEYS_FILENAME);

            if (!this.configLoader.validateConfiguration(jobList, keys)) {
                throw new Error("AdzunaProcess : Invalid configuration");
            }

            const automator = this.automatorFactory.createAutomator(keys);

            const results = await automator.automate(jobList);

            if (this.schedulerManager && this.schedulerManager.scheduler) {
                const nextRun = this.schedulerManager.scheduler.getNextExecutionTime();
                Logger.info(`AdzunaProcess : Collecting successfully finished. Next scheduled run is at: ${nextRun}`);
            }

            return await this.resultProcessor.process(results, AdzunaRequestSender.DATA_PROVIDER);
        } catch (error) {
            Logger.info("AdzunaProcess : Something went wrong in collection process");
            Logger.error(error);

            if (this.schedulerManager && this.schedulerManager.scheduler) {
                const nextRun = this.schedulerManager.scheduler.getNextExecutionTime();
                Logger.info(`AdzunaProcess : Skipping today's execution due to error. Next scheduled run is at: ${nextRun}`);
            } else {
                Logger.info("AdzunaProcess : Skipping today's execution due to error. Waiting for next scheduled run.");
            }

            throw error;
        }
    }
}

module.exports = AdzunaCollectorProcess;
