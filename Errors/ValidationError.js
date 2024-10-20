class ValidationError extends Error {
    constructor(message, model, field) {
        super(
            `Validation Error - Model: ${model}, Field: ${field}, Message: ${message}`
        );
        this.model = model;
        this.field = field;
        this.statusCode = 400;
    }
}

module.exports = ValidationError;
