const Logger = require("../Loggers/CollectorLogger");
const MaxRetriesReachedError = require("./MaxRetriesReachedError");

class RetryWithDelay {
    static DELAYS = [500, 1000, 2000, 5000, 10000];

    /**
     * Initialize the RetryWithDelay class with configuration.
     *
     * @param {number} maxRetries - Maximum number of retry attempts.
     * @param {array} errorCodesToIgnore - Error codes that should not trigger retries
     * @param {Function} onRetry - Optional callback invoked on each retry (e.g., logging).
     */
    constructor(maxRetries = 5, errorCodesToIgnore = [], onRetry = null) {
        if (maxRetries < 0) throw new Error("maxRetries must be a positive integer");

        this.maxRetries = maxRetries;
        this.excludedErrorCodes = errorCodesToIgnore;
        this.onRetry = onRetry || this.defaultOnRetry;
    }

    static getDelay(retryCount) {
        return RetryWithDelay.DELAYS[Math.min(retryCount, RetryWithDelay.DELAYS.length - 1)];
    }

    static async sleep(delay) {
        return new Promise(resolve => setTimeout(resolve, delay));
    }

    defaultOnRetry(retryCount, delay, error) {
        Logger.debug(`Retry attempt ${retryCount} after ${delay}ms. Error: ${error.message}`);
    }

    shouldRetry(error) {
        return !error?.status || !this.excludedErrorCodes.includes(error.status);
    }

    /**
     * Executes the provided operation with retry and delay logic.
     *
     * @param {Function} operation - The asynchronous function that needs retry handling.
     * @param {Object} context - Optional context object passed to onRetry callback
     * @returns {Promise} - Resolves the operation's result or rejects after retries.
     */
    async execute(operation, context = {}) {
        let retryCount = 0;

        if (typeof operation !== 'function') {
            throw new Error("operation must be a function");
        }

        while (retryCount <= this.maxRetries) {
            try {
                return await operation();
            } catch (error) {
                if (!this.shouldRetry(error)) {
                    throw error;
                }

                if (retryCount >= this.maxRetries) {
                    throw new MaxRetriesReachedError(retryCount, error.message);
                }

                const delay = RetryWithDelay.getDelay(retryCount);
                await this.onRetry(retryCount + 1, delay, error, context);
                await RetryWithDelay.sleep(delay);
                retryCount++;
            }
        }
    }
}

module.exports = RetryWithDelay;
