const AdzunaRequestSender = require("../RequestSenders/AdzunaRequestSender");
const JobPostHandler = require("../Handlers/JobPostHandler");
const RetryWithDelay = require("../ErrorHandlingStrategies/RetryWithDelay");
const AdzunaCollector = require("../Collectors/AdzunaCollector");
const AdzunaAutomator = require("../Automators/AdzunaAutomator");
const AdzunaConverter = require("../Converters/AdzunaConverter");
const JobPostService = require("../../Services/JobPostService");

class AdzunaAutomatorFactory {
    static createAutomator(keys) {
        const sender = new AdzunaRequestSender();
        const handler = new JobPostHandler(AdzunaConverter, JobPostService);
        const collector = new AdzunaCollector(sender, handler);
        const retryHandler = new RetryWithDelay(
            parseInt(process.env.MAX_RETRIES, 10) || 5,
            [],
            null,
            parseInt(process.env.ERROR_WINDOW, 10) || 20000
        );

        return new AdzunaAutomator(
            new Set(keys),
            sender,
            collector,
            retryHandler
        );
    }
}

module.exports = AdzunaAutomatorFactory;
