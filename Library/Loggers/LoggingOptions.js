const winston = require("winston");
const {combine, timestamp, printf, align, errors, json} = winston.format;
const {formatInTimeZone} = require("date-fns-tz");

const timeZone = "Europe/Rome";

const errorFilter = winston.format((info, opts) => {
    return info.level === "error" ? info : false;
});

const infoFilter = winston.format((info, opts) => {
    return info.level === "info" ? info : false;
});

const getOptions = (service) => {
    return {
        levels: winston.config.syslog.levels,
        level: process.env.LOG_LEVEL || "info",
        defaultMeta: {
            service: service,
        },
        format: combine(
            errors({stack: true}),
            timestamp({
                format: () =>
                    formatInTimeZone(new Date(), timeZone, "yyyy-MM-dd HH:mm:ssXXX"),
            }),
            json(),
            printf(
                (msg) => {
                    const pid = `<PID:${process.pid}>`
                    const service = `<${msg.service}>`
                    const level = `${msg.level}`
                    return `[${msg.timestamp}] ${pid} ${service} ${level}: ${msg.message}`
                }
            )
        ),
        transports: [
            new winston.transports.Console(),
            new winston.transports.File({
                dirname: "logs",
                filename: `/logs/${service}_combined.log`,
            }),
            new winston.transports.File({
                filename: `/logs/${service}_app-error.log`,
                dirname: "logs",
                level: "error",
                format: combine(errorFilter(), timestamp(), json()),
            }),
            new winston.transports.File({
                filename: `/logs/${service}_app-info.log`,
                dirname: "logs",
                level: "info",
                format: combine(infoFilter(), timestamp(), json()),
            }),
        ],
        exceptionHandlers: [
            new winston.transports.File({
                dirname: "logs",
                filename: `/logs/${service}_exception.log`,
            }),
        ],
        rejectionHandlers: [
            new winston.transports.File({
                dirname: "logs",
                filename: `/logs/${service}_rejections.log`,
            }),
        ],
    };
}

module.exports = getOptions