const Logger = require("../Loggers/CollectorLogger");
require("dotenv").config();

// error codes
const KEY_DELETE_ERROR_CODES = [429, 403, 401];
const ERROR_CODES = [...KEY_DELETE_ERROR_CODES, 400];

class RapidAPIAutomator {
    /**
     * @param {Set} keys - Set of API keys.
     * @param sender
     * @param collector
     * @param {*} config - Configuration for API_URL, API_HOST.
     */
    constructor(keys, sender, collector, config) {
        if (!(keys instanceof Set)) {
            throw new Error("keys must be a set");
        }
        this.keys = keys;
        this.config = config;
        this.sender = sender;
        this.collector = collector;
    }

    /**
     * Collects job data for each job type using the provided API keys.
     *
     * @param {Array} jobTypesList - List of job types to collect data for.
     * @param {Object} options - Options that include pagination state.
     * @returns {Array} results - Collected job responses.
     */
    async collect(jobTypesList, options = {}) {
        const results = [];

        for (const key of this.keys) {
            try {
                this.sender.setApiKey(key);

                for (const jobType of jobTypesList) {
                    Logger.debug(`key: ${key} - job: ${jobType}`);

                    // Always reset pagination for a new job type attempt.
                    const response = await this.collector.searchJobsByType(jobType, options);

                    Logger.debug(JSON.stringify(response));
                    console.log(response);
                    results.push(response);

                    options.requestedPage = "";
                }
                Logger.debug("Exiting the loop, collected all job types");
                return results;
            } catch (error) {
                this.handleCollectError(error, jobTypesList, options, key);
            }

        }

        return results;
    }

    /**
     * Handles errors from the collect process.
     *
     * - Removes invalid API keys.
     * - Updates the pagination (nextPage) based on the job type that caused the error.
     * - Slices the job types list to resume processing from the errored job type.
     *
     * @param {Object} error - Error object with status, jobType, etc.
     * @param {Array} jobTypesList - Current list of job types.
     * @param {Object} options - Options that include pagination state.
     * @param {string} key - The API key used during the failed request.
     */
    handleCollectError(error, jobTypesList, options, key) {
        if (!ERROR_CODES.includes(error.status)) {
            throw error;
        }

        if (KEY_DELETE_ERROR_CODES.includes(error.status)) {
            Logger.debug(`The key ${key} isn't valid anymore! Removing it.`);
            this.keys.delete(key);
        }

        Logger.info(`Last job type ${error.jobType}, last page ${error.requestedPage}`);

        // If the errored job type is the next one to process, preserve its pagination state.
        if (jobTypesList[0] === error.jobType) {
            options.requestedPage = error?.receivedItems < 10 ? "" : error.requestedPage;
        } else {
            options.requestedPage = "";
        }

        const indexOfJob = jobTypesList.indexOf(error.jobType);
        if (indexOfJob > 0) {
            Logger.debug(`Slicing the job types list from index ${indexOfJob}`);
            jobTypesList.splice(0, indexOfJob);
        }
    }
}

module.exports = RapidAPIAutomator;
