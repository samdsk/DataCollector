const {logResultsToJSONFile} = require("../Loggers/ResultsLogger");
const Logger = require("../Loggers/CollectorLogger");

class RapidAPIResultsProcessor {
    static async process(results) {
        Logger.info("Logging results summary");
        await logResultsToJSONFile("summary", new Date(Date.now()), results);
        Logger.info(JSON.stringify(results));
        return results;
    }

}

module.exports = RapidAPIResultsProcessor;