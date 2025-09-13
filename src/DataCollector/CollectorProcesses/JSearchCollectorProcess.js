const Logger = require("../Loggers/CollectorLogger");
const JSearchProcess = require("../RequestSenders/AdzunaRequestSender");

class JSearchCollectorProcess {
    constructor(automatorFactory, resultProcessor, configLoader, schedulerManager) {
        this.automatorFactory = automatorFactory;
        this.resultProcessor = resultProcessor;
        this.configLoader = configLoader;
        this.schedulerManager = schedulerManager;
    }

    async execute() {
        try {
            const jobList = await this.configLoader.loadJobTypes(process.env.RAPID_API_JOBTYPES_FILENAME);
            const keys = await this.configLoader.loadKeys(process.env.RAPID_API_KEYS_FILENAME);

            if (!this.configLoader.validateConfiguration(jobList, keys)) {
                throw new Error("JSearchProcess : Invalid configuration");
            }

            const automator = this.automatorFactory.createAutomator(keys);

            const results = await automator.automate(jobList);

            if (this.schedulerManager && this.schedulerManager.scheduler) {
                const nextRun = this.schedulerManager.scheduler.getNextExecutionTime();
                Logger.info(`JSearchProcess : Collecting successfully finished. Next scheduled run is at: ${nextRun}`);
            }

            return await this.resultProcessor.process(results, JSearchProcess.DATA_PROVIDER);
        } catch (error) {
            Logger.info("JSearchProcess : Something went wrong in collection process");
            Logger.error(error);

            if (this.schedulerManager && this.schedulerManager.scheduler) {
                const nextRun = this.schedulerManager.scheduler.getNextExecutionTime();
                Logger.info(`JSearchProcess : Skipping today's execution due to error. Next scheduled run is at: ${nextRun}`);
            } else {
                Logger.info("JSearchProcess : Skipping today's execution due to error. Waiting for next scheduled run.");
            }

            throw error;
        }
    }
}

module.exports = JSearchCollectorProcess;
