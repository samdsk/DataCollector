const crypto = require("crypto");
const DataCleaning = require("./DataCleaning");
const Logger = require("../Loggers/CollectorLogger");

/**
 * Generates a string without spaces and special characters using title, company and location fields of a jobpost
 * @param {JobPost} job_post required a valid JobPost
 * @returns string
 * @throws an error if JobPost is invalid
 */
function jobToStringTitleCompanyLocation(job_post) {
    Logger.debug(
        `JobToString: title: ${job_post.title} company: ${job_post.company} location: ${job_post.location}`
    );

    if (!job_post.title || !job_post.company || !job_post.location) {
        Logger.debug("JobToString: Invalid JobPost " + JSON.stringify(job_post));
        throw new Error(
            `Invalid JobPost! title: ${job_post.title} company: ${job_post.company} location: ${job_post.location}`
        );
    }

    if (
        typeof job_post.title !== "string" ||
        typeof job_post.company !== "string" ||
        typeof job_post.location !== "string"
    ) {
        Logger.debug(
            "JobToString: String check : Invalid JobPost " + JSON.stringify(job_post)
        );
        throw new Error(
            `Invalid JobPost! String type check  title: ${job_post.title} company: ${job_post.company} location: ${job_post.location}`
        );
    }

    const replace = "";

    let output = "";
    output += DataCleaning.cleanString(job_post.title, replace);
    output += DataCleaning.cleanString(job_post.company, replace);
    output += DataCleaning.cleanString(job_post.location, replace);
    return output.toLowerCase();
}

/**
 * Generates an unique string based on title, company and location fields of a JobPost object
 * @param {JobPost} job_post requires a valid JobPost
 * @returns base64 string
 */
function generateJobPostID(job_post) {
    const strToHash = jobToStringTitleCompanyLocation(job_post);
    return crypto.createHash("sha512").update(strToHash).digest("base64");
}

module.exports = {
    jobToStringTitleCompanyLocation,
    generateJobPostID,
};
