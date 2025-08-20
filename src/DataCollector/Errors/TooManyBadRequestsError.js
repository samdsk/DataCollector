class TooManyBadRequestsError extends Error {
    constructor(consecutiveErrors, jobType, originalError) {
        super(`Too many bad requests (${consecutiveErrors}) for job type: ${jobType}. Skipping.`);
        this.name = 'TooManyBadRequestsError';
        this.consecutiveErrors = consecutiveErrors;
        this.jobType = jobType;
        this.originalError = originalError;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = TooManyBadRequestsError;
