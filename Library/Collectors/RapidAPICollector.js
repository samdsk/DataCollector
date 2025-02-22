const ResultLogger = require("../resultsLogger");
const Logger = require("../Loggers/CollectorLogger");
require("dotenv").config();

const DEFAULT_LIMIT = 3;
const LIMIT = process.env.REQUEST_LIMIT || DEFAULT_LIMIT;

/**
 * collects job descriptions from Rapid API's Job Search API
 */
class Collector {
    /**
     * @param {RequestSender} RequestSender a Class with sendRequest method
     */
    constructor(RequestSender, JobPostController) {
        this.RequestSender = RequestSender;
        this.JobPostController = JobPostController;
    }

    async logResults(results) {
        // logging search results
        await ResultLogger.logResultsToJSONFile(
            `results_${results.job_type}`,
            results.searchDate,
            results
        );
    }

    async logFullResponse(job_type, date, response) {
        await ResultLogger.logResultsToJSONFile(
            `full_results/${job_type}`,
            date,
            response
        );
    }

    /**
     * Collect Job descriptions for the given JobType
     * @param {String} JOB_TYPE which type of job you want to search
     * @param {Object} [RequestOptions] Object which contains optionalParams of sendRequest method
     * @returns an Object containing a summary of collected data and an array of actual data obtained from API
     */
    async searchJobsByType(JOB_TYPE, RequestOptions) {
        const searchDate = new Date(Date.now());

        let searchResults = {
            job_type: JOB_TYPE,
            searchDate: searchDate,
            jobs: [],
        };

        // collecting actual response data for debug purposes
        let actualResponseData = [];

        let jobCount = 10;
        let requestedPage = RequestOptions?.requestedPage || "";
        let insertedCount = 0;

        let requestCount = 0;

        // use REQUEST_LIMIT env variable to vary the limit
        do {
            let data = await this.RequestSender.sendRequest(
                JOB_TYPE,
                requestedPage,
                RequestOptions
            );

            insertedCount += await this.insertJobs(
                data.jobs,
                JOB_TYPE,
                data.language
            );

            actualResponseData.push(data);
            searchResults.jobs = searchResults.jobs.concat(data.jobs);

            if (!searchResults?.location) searchResults.location = data.location;
            if (!searchResults?.language) searchResults.language = data.language;

            jobCount = parseInt(data.jobCount, 10);
            requestCount++;
            requestedPage = data.nextPage;
        } while (jobCount >= 10 && requestCount < LIMIT);

        await this.logResults(searchResults);
        await this.logFullResponse(JOB_TYPE, searchDate, actualResponseData);

        // inserting jobs to db

        Logger.info(
            `Collected: ${
                searchResults.jobs.length
            } and inserted ${insertedCount} duplicates:${
                searchResults.jobs.length - insertedCount
            } to DB by JobType: ${JOB_TYPE} Location:${
                searchResults.location
            } Language:${searchResults.language}`
        );

        return {
            job_type: JOB_TYPE,
            searchDate: searchDate,
            collected: searchResults.jobs.length,
            inserted: insertedCount,
            location: searchResults.location,
            language: searchResults.language,
        };
    }

    /**
     *
     * @param {[String]} JobTypes a list of strings containing job types to search
     * @param {Object} [RequestOptions] Object which contains optionalParams of sendRequest method
     * @returns [Object] returns an array of results per job type
     */
    async searchJobTypeList(JobTypes, RequestOptions) {
        const results = [];
        for (const job_type of JobTypes) {
            const tempRes = await this.searchJobsByType(job_type, RequestOptions);
            results.push({job_type: job_type, response: tempRes});
        }

        return results;
    }

    async insertJobs(jobs, job_type, language) {
        return await this.JobPostController.insertListOfJobs(
            jobs,
            job_type,
            language
        );
    }
}

module.exports = Collector;
