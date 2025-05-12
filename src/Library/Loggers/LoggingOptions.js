const winston = require("winston");
const {combine, timestamp, printf, errors, colorize, splat} = winston.format;
const {formatInTimeZone} = require("date-fns-tz");
const path = require("path");
const DailyRotateFile = require("winston-daily-rotate-file");
require('dotenv').config();

const timeZone = "Europe/Rome";

const nodeEnv = process.env.NODE_ENV || 'development';
const logLevel = (process.env.LOG_LEVEL || (nodeEnv === 'production' ? 'info' : 'debug'));
const logsDir = nodeEnv === 'production' ? 'logs/prod' : (nodeEnv === 'test' ? 'logs/test' : 'logs/dev');

const plainTextFormatter = printf((msg) => {
    const pid = `<PID:${process.pid}>`;
    const svc = `<${msg.service}>`;
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

const baseFormat = combine(
    errors({stack: true}),
    splat(),
    timestamp({
        format: () => formatInTimeZone(new Date(), timeZone, "yyyy-MM-dd HH:mm:ssXXX"),
    })
);

const createDailyRotateTransport = (service, level, formatter, filenameSuffix) => new DailyRotateFile({
    dirname: path.join(process.cwd(), logsDir),
    filename: `${service}_${filenameSuffix}-%DATE%.log`,
    level,
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "14d",
    format: formatter,
});

const getOptions = (service) => {
    return {
        level: logLevel,
        defaultMeta: {service},
        format: baseFormat,
        transports: [
            new winston.transports.Console({
                level: logLevel,
                format: combine(colorize(), plainTextFormatter)
            }),
            createDailyRotateTransport(service, "debug", plainTextFormatter, "combined"),
            createDailyRotateTransport(service, "error", combine(timestamp(), winston.format.json()), "app-error"),
            createDailyRotateTransport(service, "info", combine(timestamp(), winston.format.json()), "app-info"),
            createDailyRotateTransport(service, "debug", combine(timestamp(), winston.format.json()), "app-debug"),
        ],
        exceptionHandlers: [
            createDailyRotateTransport(service, "error", plainTextFormatter, "exception")
        ],
        rejectionHandlers: [
            createDailyRotateTransport(service, "error", plainTextFormatter, "rejections")
        ]
    };
};

module.exports = getOptions;
