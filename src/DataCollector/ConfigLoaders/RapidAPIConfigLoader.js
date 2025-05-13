const {getJobTypesFromFile, getJSONFromFile} = require("../Utils/Utils");
const Logger = require("../Loggers/CollectorLogger");

class RapidAPIConfigLoader {
    static async loadJobTypes(filename) {
        const jobList = await getJobTypesFromFile(filename) || [];
        Logger.info(`Loaded ${jobList.length} job types.`);
        return jobList;
    }

    static async loadKeys(filename) {
        const keys = await getJSONFromFile(filename) || [];
        Logger.info(`Loaded ${keys.length} keys.`);
        return keys;
    }

    static validateConfiguration(jobList, keys) {
        if (jobList.length === 0 || keys.length === 0) {
            Logger.info("No job types or keys found. Exiting.");
            return false;
        }
        return true;
    }

}

module.exports = RapidAPIConfigLoader;