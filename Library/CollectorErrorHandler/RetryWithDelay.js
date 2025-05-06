const MaxRetriesReachedError = require("./MaxRetriesReachedError");

class RetryWithDelay {
    static DELAYS = [500, 1000, 2000, 5000, 10000];

    /**
     * Initialize the RetryWithDelay class with configuration.
     *
     * @param {number} maxRetries - Maximum number of retry attempts.
     * @param {number} baseDelay - Base delay (in milliseconds) for retries (used for exponential backoff).
     * @param errorCodes
     * @param {Function} onRetry - Optional callback invoked on each retry (e.g., logging).
     */
    constructor(maxRetries = 5, onRetry = null) {
        if (maxRetries < 0) throw new Error("maxRetries must be a positive integer")

        this.maxRetries = maxRetries;
        this.onRetry = onRetry; // Optional callback for retry-specific behavior
    }

    static getDelay(retryCount) {
        return RetryWithDelay.DELAYS[Math.min(retryCount, RetryWithDelay.DELAYS.length - 1)];
    };

    static async sleep(delay) {
        return new Promise(resolve => setTimeout(resolve, delay));
    }

    /**
     * Executes the provided operation with retry and delay logic.
     *
     * @param {Function} operation - The asynchronous function that needs retry handling.
     * @returns {Promise} - Resolves the operation's result or rejects after retries.
     */
    async execute(operation) {
        let retryCount = 0;

        if (operation === undefined || typeof operation !== 'function') throw new Error("operation must be a function")

        while (retryCount <= this.maxRetries) {
            try {
                // Attempt the operation
                return await operation();
            } catch (error) {
                if (retryCount >= this.maxRetries) {
                    throw new MaxRetriesReachedError(retryCount, error.message);
                }

                const delay = RetryWithDelay.getDelay(retryCount);

                if (this.onRetry) {
                    this.onRetry(retryCount + 1, delay, error); // Pass retryCount (1-based), delay, and error
                }

                await RetryWithDelay.sleep(delay);

                retryCount++;
            }
        }
    }
}

module.exports = RetryWithDelay;