class MaxRetriesReachedError extends Error {
    constructor(retryCount, lastError) {
        const message = `Maximum retries of ${retryCount} have been reached. Last error: ${lastError?.message || "Unknown error"}`;

        super(message);

        this.name = this.constructor.name;
        this.retryCount = retryCount;
        this.lastError = lastError;
        this.statusCode = lastError?.statusCode || 500;

        // Capture stack trace excluding the constructor call
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = MaxRetriesReachedError;
