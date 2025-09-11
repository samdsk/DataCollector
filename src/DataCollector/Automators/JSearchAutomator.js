const Logger = require("../Loggers/CollectorLogger");
const MaxRetriesReachedError = require("../Errors/MaxRetriesReachedError");
require("dotenv").config();


class JSearchAutomator {
    static KEY_DELETE_ERROR_CODES = [429, 403, 401];

    constructor(keys, sender, collector, retryHandler, config) {
        if (!(keys instanceof Set)) {
            throw new Error("JSearchAutomator: keys must be a set");
        }
        this.keys = keys;
        this.config = config;
        this.sender = sender;
        this.collector = collector;
        this.retryHandler = retryHandler;
        this.retryHandler.setExcludedErrorCodes(JSearchAutomator.KEY_DELETE_ERROR_CODES);
    }

    async automate(jobTypesList, options = {}) {
        const results = [];

        for (const key of this.keys) {
            try {
                this.sender.setApiKey(key);
                return await this.collectWithKey(key, jobTypesList, options);
            } catch (error) {
                if (error instanceof MaxRetriesReachedError) {
                    throw error;
                }
                this.handleCollectError(error, jobTypesList, options, key);
            }
        }

        return results;
    }

    async collectWithKey(key, jobTypesList, options) {
        const results = [];

        for (const jobType of jobTypesList) {
            Logger.debug(`key: ***${key.slice(-4)} - job: ${jobType}`);

            const context = {key, jobType, options};
            await this.retryHandler.execute(
                async () => {
                    const response = await this.collector.collect(jobType, options);
                    Logger.debug(JSON.stringify(response));
                    results.push(response);
                    options.requestedPage = 1;
                },
                context
            );

            if (this.config?.delayBetweenRequests) {
                await new Promise(resolve => setTimeout(resolve, this.config.delayBetweenRequests));
            }
        }

        Logger.debug("JSearchAutomator: Collected all job types, exiting...");
        return results;
    }

    handleCollectError(error, jobTypesList, options, key) {
        if (JSearchAutomator.KEY_DELETE_ERROR_CODES.includes(error.status)) {
            Logger.debug(`JSearchAutomator: The key ***${key.slice(-4)} isn't valid anymore! Removing it.`);
            this.keys.delete(key);
        }

        Logger.info(`JSearchAutomator: Last job type ${error.jobType}, last page ${error.requestedPage}`);

        this.updatePaginationState(error, jobTypesList, options);
    }

    updatePaginationState(error, jobTypesList, options) {
        if (jobTypesList[0] === error.jobType) {
            options.requestedPage = error?.availableItems < 10 ? 1 : error.requestedPage;
        } else {
            options.requestedPage = 1;
        }

        const indexOfJob = jobTypesList.indexOf(error.jobType);
        if (indexOfJob > 0) {
            Logger.debug(`JSearchAutomator: Slicing the job types list from index ${indexOfJob}`);
            jobTypesList.splice(0, indexOfJob);
        }
    }
}

module.exports = JSearchAutomator;
