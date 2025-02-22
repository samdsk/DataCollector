const Collector = require("../Collectors/RapidAPICollector");
const {
    RapidAPIRequestSender,
} = require("../RequestSenders/RapidAPIRequestSender");
const Logger = require("../Loggers/CollectorLogger");
const {JobPostController} = require("../../Controllers/JobPostController");
const RapidAPIConverter = require("../Converters/RapidAPIConverter");
const JobPostService = require("../../Services/JobPostService");
const RapidAPIRequestSender_v02 = require("../RequestSenders/RapidAPIRequestSender_v02");
require("dotenv").config();

class Automate {
    /**
     *
     * @param {Set} keys key set
     * @param {*} config use it to set API_URL, API_HOST
     */
    constructor(keys, config) {
        if (!(keys instanceof Set)) throw new Error("keys must be a set");
        this.keys = keys;
        this.config = config;
    }

    async collect(jobTypesList, options = {}) {
        const results = [];

        const sender = new RapidAPIRequestSender_v02();
        const controller = new JobPostController(RapidAPIConverter, JobPostService);
        const collector = new Collector(sender, controller);

        let flag = true;

        while (flag && this.keys.size > 0 && jobTypesList.length > 0) {
            for (const key of this.keys) {
                try {
                    sender.API_KEY = key;

                    for (const jobType of jobTypesList) {
                        Logger.info(`key: ${key} - job: ${jobType}`);

                        const response = await collector.searchJobsByType(jobType, options);
                        Logger.debug(JSON.stringify(response));
                        console.log(response);
                        results.push(response);
                    }

                    flag = false;

                    break;
                } catch (error) {
                    if (error.status === 429 || error.status === 403) {
                        Logger.info(`The key ${key} isn't valid anymore!`);
                        this.keys.delete(key);

                        Logger.info(
                            `Last job type ${error.jobType}, last page ${error.requestedPage}`
                        );

                        options.requestedPage = error.requestedPage;

                        const indexOfJob = jobTypesList.indexOf(error.jobType);
                        if (indexOfJob > 0) {
                            Logger.debug(`Slicing the job types list until ${indexOfJob}`);

                            jobTypesList = jobTypesList.slice(indexOfJob);
                        }

                        flag = true;
                    } else {
                        throw error;
                    }
                }
            }
        }

        return results;
    }
}

module.exports = Automate;
