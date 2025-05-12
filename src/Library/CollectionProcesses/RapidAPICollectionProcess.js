const Logger = require("../Loggers/CollectorLogger");

class RapidAPICollectionProcess {
    constructor(automatorFactory, resultProcessor, configLoader) {
        this.automatorFactory = automatorFactory;
        this.resultProcessor = resultProcessor;
        this.configLoader = configLoader;
    }

    async execute() {
        try {
            const jobList = await this.configLoader.loadJobTypes(process.env.JOBTYPES_FILENAME);
            const keys = await this.configLoader.loadKeys(process.env.KEYS_FILENAME);

            if (!this.configLoader.validateConfiguration(jobList, keys)) {
                throw new Error("Invalid configuration");
            }

            const automator = this.automatorFactory.createAutomator(keys);

            const results = await automator.collect(jobList);

            return await this.resultProcessor.process(results);
        } catch (error) {
            Logger.info("Something went wrong in the RapidAPI collection process");
            Logger.error(error);
            throw error;
        }
    }
}

module.exports = RapidAPICollectionProcess;
