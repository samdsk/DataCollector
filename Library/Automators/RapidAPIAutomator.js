const Collector = require("../Collectors/RapidAPICollector");
const Logger = require("../Loggers/CollectorLogger");
const {JobPostController} = require("../../Controllers/JobPostController");
const RapidAPIConverter = require("../Converters/RapidAPIConverter");
const JobPostService = require("../../Services/JobPostService");
const RapidAPIRequestSender_v02 = require("../RequestSenders/RapidAPIRequestSender_v02");
require("dotenv").config();

// error codes
const KEY_DELETE_ERROR_CODES = [429, 403, 401];
const ERROR_CODES = [...KEY_DELETE_ERROR_CODES, 400];

class Automate {
    /**
     * @param {Set} keys - Set of API keys.
     * @param {*} config - Configuration for API_URL, API_HOST.
     */
    constructor(keys, config) {
        if (!(keys instanceof Set)) {
            throw new Error("keys must be a set");
        }
        this.keys = keys;
        this.config = config;
    }

    /**
     * Initializes and returns the necessary dependencies.
     */
    init() {
        const sender = new RapidAPIRequestSender_v02();
        const controller = new JobPostController(RapidAPIConverter, JobPostService);
        const collector = new Collector(sender, controller);
        return {sender, collector};
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
        const {sender, collector} = this.init();
        let shouldContinue = true;

        while (shouldContinue && this.keys.size > 0 && jobTypesList.length > 0) {
            for (const key of Array.from(this.keys)) {
                try {
                    sender.API_KEY = key;

                    for (const jobType of jobTypesList) {
                        Logger.debug(`key: ${key} - job: ${jobType}`);

                        // Always reset pagination for a new job type attempt.
                        const response = await collector.searchJobsByType(jobType, options);

                        Logger.debug(JSON.stringify(response));
                        console.log(response);
                        results.push(response);

                        options.requestedPage = "";
                    }

                    shouldContinue = false;
                    break; // Break out of the keys loop if all job types succeed.
                } catch (error) {
                    // Handle known error codes.
                    this.handleCollectError(error, jobTypesList, options, key);
                    // Continue looping: if an error occurs, we set shouldContinue to true.
                    shouldContinue = true;
                }
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
            // Update jobTypesList to resume from the error-causing job type.
            jobTypesList.splice(0, indexOfJob);
        }
    }
}

module.exports = Automate;
