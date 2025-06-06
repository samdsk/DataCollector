const fs = require("fs");
const path = require("path");
const {RESULTS_DIR} = require("../PathContants");

fs.mkdirSync(RESULTS_DIR, {recursive: true});

const getPathCompatibleStringFromDate = (date) => {
    return date.toISOString().replaceAll(":", "-");
};

/**
 * Logging data to a Json file which has a timestamp as a suffix
 * Files will be saved in the dir './results/'
 * @param {string} filename prefix of filename
 * @param {Date} date
 * @param {Object} data to log
 */
const logResultsToJSONFile = async (filename, date, data) => {
    const timeStamp = getPathCompatibleStringFromDate(date);

    await fs.promises.writeFile(
        path.join(RESULTS_DIR, `${filename}_${timeStamp}.json`),
        JSON.stringify(data),
        {
            flag: "w",
        }
    );
};

module.exports = {
    logResultsToJSONFile,
    RESULTS_DIR,
    getPathCompatibleStringFromDate,
};
