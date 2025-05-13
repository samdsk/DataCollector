const RapidAPIRequestSender_v02 = require("../RequestSenders/RapidAPIRequestSender_v02");
const JobPostHandler = require("../Handlers/JobPostHandler");
const RetryWithDelay = require("../CollectorErrorHandler/RetryWithDelay");
const RapidAPICollector = require("../Collectors/RapidAPICollector");
const RapidAPIAutomator = require("../Automators/RapidAPIAutomator");
const RapidAPIConverter = require("../Converters/RapidAPIConverter");
const JobPostService = require("../../Services/JobPostService");

class RapidAPIAutomatorFactory {
    static createAutomator(keys) {
        const sender = new RapidAPIRequestSender_v02();
        const handler = new JobPostHandler(RapidAPIConverter, JobPostService);
        const collector = new RapidAPICollector(sender, handler);
        const retryHandler = new RetryWithDelay(
            parseInt(process.env.MAX_RETRIES, 10) || 5,
            [],
            null,
            parseInt(process.env.ERROR_WINDOW, 10) || 3000
        );

        return new RapidAPIAutomator(
            new Set(keys),
            sender,
            collector,
            retryHandler,
            {
                API_URL: process.env.API_URL,
                API_HOST: process.env.API_HOST
            }
        );
    }
}

module.exports = RapidAPIAutomatorFactory;
