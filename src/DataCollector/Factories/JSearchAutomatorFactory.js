const JSearchRequestSender = require("../RequestSenders/JSearchRequestSender");
const JobPostHandler = require("../Handlers/JobPostHandler");
const RetryWithDelay = require("../ErrorHandlingStrategies/RetryWithDelay");
const JSearchCollector = require("../Collectors/JSearchCollector");
const JSearchAutomator = require("../Automators/JSearchAutomator");
const JSearchConverter = require("../Converters/JSearchConverter");
const JobPostService = require("../../Services/JobPostService");

class JSearchAutomatorFactory {
    static createAutomator(keys) {
        const sender = new JSearchRequestSender();
        const handler = new JobPostHandler(JSearchConverter, JobPostService);
        const collector = new JSearchCollector(sender, handler);
        const retryHandler = new RetryWithDelay(
            parseInt(process.env.MAX_RETRIES, 10) || 5,
            [],
            null,
            parseInt(process.env.ERROR_WINDOW, 10) || 20000
        );

        return new JSearchAutomator(
            new Set(keys),
            sender,
            collector,
            retryHandler,
            {
                API_URL: process.env.RAPID_API_API_URL,
                API_HOST: process.env.RAPID_API_API_HOST,
                delayBetweenRequests: parseInt(process.env.DELAY_BETWEEN_REQUESTS, 10) || 1000,
            }
        );
    }
}

module.exports = JSearchAutomatorFactory;
