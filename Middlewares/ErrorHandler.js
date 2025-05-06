const ValidationError = require("../Errors/ValidationError");
const RequestError = require("../Errors/RequestError");
const MongooseValidationError = require("../Errors/MongooseValidationError");

const {default: mongoose} = require("mongoose");
const Logger = require("../Library/Loggers/ServerLogger");

const ErrorHandler = (err, req, res, next) => {
    if (err) {
        Logger.error(err.stack);
        if (err instanceof mongoose.Error.ValidationError) {
            err = new MongooseValidationError(err.message);
        }

        if (err instanceof mongoose.Error.CastError) {
            err = new RequestError(`Invalid value for '${err.path}' = '${err.value}'`);
        }

        if (err.code === 11000)
            err = new RequestError(`Possible duplication detected`);


        res.status(err.statusCode || 500);

        if (err.statusCode) {
            return res.status(err.statusCode).json({
                success: false,
                error: {
                    code: err.statusCode,
                    message: err.message,
                }
            });
        }

        return res.status(500).json({
            success: false,
            error: {
                code: 500,
                message: "Internal Server Error",
            }
        });
    }
};

module.exports = ErrorHandler;
