const winston = require("winston");
const {combine, timestamp, printf, errors, colorize, splat} = winston.format;
const {formatInTimeZone} = require("date-fns-tz");
const path = require("path");
const DailyRotateFile = require("winston-daily-rotate-file");

const timeZone = "Europe/Rome";

// Formatter for plain text output (non-JSON)
const plainTextFormatter = printf((msg) => {
    const pid = `<PID:${process.pid}>`;
    const svc = `<${msg.service}>`;
    // Include error details if an error object is logged
    let additionalInfo = "";
    if (msg.response) {
        additionalInfo += `\nResponse Status: ${msg.response.status}`;
        if (msg.response.data) {
            additionalInfo += `\nResponse Data: ${JSON.stringify(msg.response.data)}`;
        }
    }
    if (msg.request) {
        additionalInfo += `\nRequest: ${JSON.stringify(msg.request._header || msg.request)}`;
    }
    const errorOutput = msg.stack ? `\nStack Trace:\n${msg.stack}` : "";
    return `[${msg.timestamp}] ${pid} ${svc} ${msg.level}: ${msg.message}${additionalInfo}${errorOutput}`;
});

const getOptions = (service) => {
    const baseFormat = combine(
        errors({stack: true}),
        splat(),
        timestamp({
            format: () =>
                formatInTimeZone(new Date(), timeZone, "yyyy-MM-dd HH:mm:ssXXX"),
        })
    );

    return {
        level: process.env.LOG_LEVEL || "info",
        defaultMeta: {
            service: service,
        },
        format: baseFormat,
        transports: [
            // Console transport using colored output
            new winston.transports.Console({
                format: combine(
                    colorize(),
                    plainTextFormatter
                )
            }),
            // Daily rotated file for combined logs in plain text (non-JSON)
            new DailyRotateFile({
                dirname: path.join(process.cwd(), "logs"),
                filename: `${service}_combined-%DATE%.log`,
                datePattern: "YYYY-MM-DD",
                zippedArchive: true,
                maxSize: "20m",
                maxFiles: "14d",
                // Use the plain text formatter for the file as well:
                format: plainTextFormatter
            }),
            // Daily rotated file for error logs in JSON format
            new DailyRotateFile({
                dirname: path.join(process.cwd(), "logs"),
                filename: `${service}_app-error-%DATE%.log`,
                level: "error",
                datePattern: "YYYY-MM-DD",
                format: combine(
                    // Optionally filter out non-error logs
                    winston.format((info) => info.level === "error" ? info : false)(),
                    timestamp(),
                    winston.format.json()
                ),
                zippedArchive: true,
                maxSize: "20m",
                maxFiles: "14d",
            }),
            // Daily rotated file for info logs in JSON format
            new DailyRotateFile({
                dirname: path.join(process.cwd(), "logs"),
                filename: `${service}_app-info-%DATE%.log`,
                level: "info",
                datePattern: "YYYY-MM-DD",
                format: combine(
                    winston.format((info) => info.level === "info" ? info : false)(),
                    timestamp(),
                    winston.format.json()
                ),
                zippedArchive: true,
                maxSize: "20m",
                maxFiles: "14d",
            }),
        ],
        exceptionHandlers: [
            new DailyRotateFile({
                dirname: path.join(process.cwd(), "logs"),
                filename: `${service}_exception-%DATE%.log`,
                datePattern: "YYYY-MM-DD",
                format: plainTextFormatter,
                zippedArchive: true,
                maxSize: "20m",
                maxFiles: "14d",
            }),
        ],
        rejectionHandlers: [
            new DailyRotateFile({
                dirname: path.join(process.cwd(), "logs"),
                filename: `${service}_rejections-%DATE%.log`,
                datePattern: "YYYY-MM-DD",
                format: plainTextFormatter,
                zippedArchive: true,
                maxSize: "20m",
                maxFiles: "14d",
            }),
        ],
    };
};

module.exports = getOptions;
