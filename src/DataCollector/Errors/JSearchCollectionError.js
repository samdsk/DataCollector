class JSearchCollectionError extends Error {
    constructor(message, options = {}) {
        const errorMessage = message || options.originalError?.message || "Unknown JSearch collection error";
        super(errorMessage);


        this.name = this.constructor.name;
        this.status = options.status || options.originalError?.response?.status;
        this.jobType = options.jobType;
        this.requestedPage = options.requestedPage;
        this.availableItems = options.availableItems || 0;

        this.originalError = options.originalError;

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = JSearchCollectionError;