import {getJobTypesFromFile, getJSONFromFile} from "./Utils";

const Logger = require("../Loggers/CollectorLogger")

class DataLoader {
    async loadJobTypes(filename) {
        const jobList = await getJobTypesFromFile(filename) || [];
        Logger.info(`Loaded ${jobList.length} job types.`);
        return jobList;
    }

    async loadAPIKeys(filename) {
        const keys = await getJSONFromFile(filename) || [];
        Logger.info(`Loaded ${keys.length} keys.`);
        return new Set(keys);
    }
}


export default DataLoader;