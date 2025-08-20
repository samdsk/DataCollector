const Logger = require("../Loggers/CollectorLogger");
const MaxRetriesReachedError = require("../Errors/MaxRetriesReachedError");
const TooManyBadRequestsError = require("../Errors/TooManyBadRequestsError");

class RetryWithDelay {
    static DELAYS = [500, 1000, 2000, 5000, 10000];
    static DEFAULT_ERROR_WINDOW = 60000;
    static BAD_REQUEST_THRESHOLD = 5;

    /**
     * Initialize the RetryWithDelay class with configuration.
     *
     * @param {number} maxRetries - Maximum number of retry attempts.
     * @param {array} excludedErrorCodes - Error codes that should not trigger retries
     * @param {Function} onRetry - Optional callback invoked on each retry (e.g., logging).
     * @param {number} errorWindow - Time window in ms to track errors (default 1 minute)
     * @param {number} badRequestThreshold - Number of 400 errors before skipping job type (default 10)
     */
    constructor(maxRetries = 5, excludedErrorCodes = [], onRetry = null, errorWindow = RetryWithDelay.DEFAULT_ERROR_WINDOW, badRequestThreshold = RetryWithDelay.BAD_REQUEST_THRESHOLD
    ) {
        if (maxRetries < 0) throw new Error("maxRetries must be a positive integer");
        if (errorWindow < 0) throw new Error("errorWindow must be a positive integer");

        this.maxRetries = maxRetries;
        this.excludedErrorCodes = excludedErrorCodes;
        this.onRetry = onRetry || this.defaultOnRetry;
        this.errorWindow = errorWindow;
        this.badRequestThreshold = badRequestThreshold;
        this.lastErrorTime = null;
        this.consecutiveErrors = 0;
        this.consecutive400Errors = 0;

    }

    static getDelay(retryCount) {
        return RetryWithDelay.DELAYS[Math.min(retryCount, RetryWithDelay.DELAYS.length - 1)];
    }

    static async sleep(delay) {
        return new Promise(resolve => setTimeout(resolve, delay));
    }

    setExcludedErrorCodes(errorCodesToIgnore) {
        this.excludedErrorCodes = errorCodesToIgnore;
    }

    defaultOnRetry(retryCount, delay, error) {
        Logger.warn(`RetryWithDelay: Retry attempt ${retryCount} after ${delay}ms. Error: ${error.message}`);
    }

    shouldRetry(error) {
        return !error?.status || !this.excludedErrorCodes.includes(error.status);
    }

    shouldResetErrorCount() {
        if (!this.lastErrorTime) return false;
        const now = Date.now();
        const diff = (now - this.lastErrorTime)
        // Logger.debug('RetryWithDelay: shouldResetErrorCount - Diff: ' + diff + 'ms')
        return diff > this.errorWindow;
    }

    /**
     * Executes the provided operation with retry and delay logic.
     *
     * @param {Function} operation - The asynchronous function that needs retry handling.
     * @param {Object} context - Optional context object passed to onRetry callback
     * @returns {Promise} - Resolves the operation's result or rejects after retries.
     */
    async execute(operation, context = {}) {
        if (typeof operation !== 'function') {
            throw new Error("RetryWithDelay: operation must be a function");
        }

        if (this.shouldResetErrorCount()) {
            Logger.warn("RetryWithDelay: Resetting exceeded error window before initializing the operation.");
            this.consecutiveErrors = 0;
        }

        try {
            const result = await operation();
            this.consecutive400Errors = 0;
            return result;
        } catch (error) {
            const now = Date.now();

            if (this.shouldResetErrorCount()) {
                Logger.warn("RetryWithDelay: Resetting exceeded error window after error: " + error.message + "");
                this.consecutiveErrors = 0;
                this.consecutive400Errors = 0;
            }

            if (!this.shouldRetry(error)) {
                throw error;
            }

            this.lastErrorTime = now;
            this.consecutiveErrors++;

            // Track 400 errors specifically
            if (error?.status === 400 || error?.response?.status === 400) {
                this.consecutive400Errors++;
                Logger.warn(`RetryWithDelay: Bad request error ${this.consecutive400Errors}/${this.badRequestThreshold} for job type: ${context.jobType || 'unknown'}`);

                if (this.consecutive400Errors >= this.badRequestThreshold) {
                    Logger.error(`RetryWithDelay: Too many bad requests (${this.consecutive400Errors}) for job type: ${context.jobType || 'unknown'}. Skipping job type.`);
                    throw new TooManyBadRequestsError(this.consecutive400Errors, context.jobType, error);
                }
            }


            if (this.consecutiveErrors >= this.maxRetries) {
                Logger.error(`RetryWithDelay: Maximum consecutive ${this.consecutiveErrors} retries reached. Error: ${error.message}`);
                throw new MaxRetriesReachedError(this.consecutiveErrors, error);
            }

            const delay = RetryWithDelay.getDelay(this.consecutiveErrors - 1);
            await this.onRetry(this.consecutiveErrors, delay, error, context);
            await RetryWithDelay.sleep(delay);

            return this.execute(operation, context);
        }
    }
}

module.exports = RetryWithDelay;