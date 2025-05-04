const Collector = require("../Collectors/RapidAPICollector");
const Logger = require("../Loggers/CollectorLogger");
const JobPostHandler = require("../Handlers/JobPostHandler");
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
        this.sender = new RapidAPIRequestSender_v02();
        this.handler = new JobPostHandler(RapidAPIConverter, JobPostService);
        this.collector = new Collector(this.sender, this.handler);
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
                try {
                    // Wait for the exponentially delayed retry before continuing
                    await this.handleCollectError(error, jobTypesList, options, key);
                } catch (retryError) {
                    // If max retries are exceeded, log the message and stop processing
                    Logger.error(retryError.message);
                    break; // Exit the loop
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
            jobTypesList.splice(0, indexOfJob);
        }

        // Add exponential backoff with increasing delays for retries
        const maxRetries = 5; // Maximum retry attempts
        const baseDelay = 1000; // 1-second base delay for retries
        let retryCount = options.retryCount || 0;

        // Check if retries have exceeded maximum attempts
        if (retryCount >= maxRetries) {
            Logger.error(
                `Max retries (${maxRetries}) reached for key: ${key} and job type: ${error.jobType}. Stopping further attempts.`
            );
            this.keys.delete(key); // Optionally remove the key to avoid further failures
            throw new Error(
                `Max retry attempts exceeded for key: ${key}, job type: ${error.jobType}. Process halted.`
            );
        }

        // Calculate the delay time
        const delay = baseDelay * Math.pow(2, retryCount); // Exponential backoff
        Logger.info(`Retrying after ${delay}ms... Attempt: ${retryCount + 1} for key: ${key}`);

        // Wait for the delay and increment retry count
        return new Promise((resolve) => {
            setTimeout(() => {
                options.retryCount = retryCount + 1; // Update retry count in options
                resolve();
            }, delay);
        });
    }
}

module.exports = Automate;
