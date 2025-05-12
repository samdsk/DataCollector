class RequestError extends Error {
    constructor(message, statusCode = 400) {
        super(`Bad Request - Message: ${message}`);
        this.statusCode = statusCode;
    }
}

module.exports = RequestError;
