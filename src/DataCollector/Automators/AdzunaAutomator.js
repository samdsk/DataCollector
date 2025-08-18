const Logger = require("../Loggers/CollectorLogger");
const MaxRetriesReachedError = require("../Errors/MaxRetriesReachedError");
require("dotenv").config();

class AdzunaAutomator {
    static KEY_DELETE_ERROR_CODES = [429, 403, 401];

    constructor(keys, sender, collector, retryHandler, config) {
        if (!(keys instanceof Set)) {
            throw new Error("AdzunaAutomator: keys must be a set");
        }
        this.keys = keys;
        this.config = config;
        this.sender = sender;
        this.collector = collector;
        this.retryHandler = retryHandler;
        this.retryHandler.setExcludedErrorCodes(AdzunaAutomator.KEY_DELETE_ERROR_CODES);
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
                    // Reset pagination for next job type
                    options.requestedPage = 1;
                },
                context
            );
        }

        Logger.debug("AdzunaAutomator: Collected all job types, exiting...");
        return results;
    }

    handleCollectError(error, jobTypesList, options, key) {
        if (AdzunaAutomator.KEY_DELETE_ERROR_CODES.includes(error.status)) {
            Logger.debug(`AdzunaAutomator: The key ***${key.slice(-4)} isn't valid anymore! Removing it.`);
            this.keys.delete(key);
        }

        Logger.info(`AdzunaAutomator: Last job type ${error.jobType}, last page ${error.currentPage || error.requestedPage}, received ${error.receivedItems || 0} items`);

        this.updatePaginationState(error, jobTypesList, options);
    }

    updatePaginationState(error, jobTypesList, options) {
        const currentJobType = jobTypesList[0];

        if (currentJobType === error.jobType) {
            // We're dealing with the same job type that errored
            Logger.debug(`AdzunaAutomator: Handling error for current job type: ${error.jobType}`);

            // Determine the page to retry based on error context
            const pageToRetry = this.determineRetryPage(error);
            options.requestedPage = pageToRetry;

            Logger.debug(`AdzunaAutomator: Will retry from page ${pageToRetry}`);
        } else {
            // Different job type, start fresh
            Logger.debug(`AdzunaAutomator: Switching to different job type, starting from page 1`);
            options.requestedPage = 1;
        }

        // Remove completed job types from the list
        const indexOfJob = jobTypesList.indexOf(error.jobType);
        if (indexOfJob > 0) {
            Logger.debug(`AdzunaAutomator: Slicing the job types list from index ${indexOfJob}`);
            jobTypesList.splice(0, indexOfJob);
        }
    }

    /**
     * Determines which page to retry based on the error context
     * @param {Object} error - The error object with pagination context
     * @returns {number} - The page number to retry
     */
    determineRetryPage(error) {
        // If no items were received at all, start from page 1
        if (error.receivedItems === 0) {
            Logger.debug(`AdzunaAutomator: No items received, retrying from page 1`);
            return 1;
        }

        if (error.currentPage) {
            if (error.lastPageReceivedJobs > 0) {
                Logger.debug(`AdzunaAutomator: Last page had ${error.lastPageReceivedJobs} jobs, retrying page ${error.currentPage}`);
                return error.currentPage;
            } else {
                const previousPage = Math.max(1, error.currentPage - 1);
                Logger.debug(`AdzunaAutomator: Last page was empty, retrying from previous page ${previousPage}`);
                return previousPage;
            }
        }

        // Final fallback
        Logger.debug(`AdzunaAutomator: Using fallback, retrying from page 1`);
        return 1;
    }
}

module.exports = AdzunaAutomator;