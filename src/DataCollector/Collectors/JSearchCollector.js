
const ResultLogger = require("../Loggers/ResultsLogger");
const Logger = require("../Loggers/CollectorLogger");
const {DATA_PROVIDER} = require("../RequestSenders/JSearchRequestSender");
require("dotenv").config();

const DEFAULT_LIMIT = 1;
const LIMIT = DEFAULT_LIMIT;
const DEFAULT_NUM_PAGES = 10;
const NUM_PAGES = process.env.NUM_PAGES || DEFAULT_NUM_PAGES;

/**
 * collects job descriptions from Rapid API's Job Search API
 */
class Collector {
    /**
     * @param {JSearchRequestSender} RequestSender a Class with sendRequest method
     * @param JobPostHandler
     */
    constructor(RequestSender, JobPostHandler) {
        this.RequestSender = RequestSender;
        this.JobPostHandler = JobPostHandler;
    }

    async logResults(results) {
        // logging search results
        await ResultLogger.logResultsToJSONFile(
            `results_${DATA_PROVIDER}_${results.job_type}`,
            results.searchDate,
            results
        );
    }

    async logFullResponse(job_type, date, response) {
        await ResultLogger.logResultsToJSONFile(
            `full_response_${DATA_PROVIDER}_${job_type}`,
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
    async collect(JOB_TYPE, RequestOptions) {
        const searchDate = new Date(Date.now());

        let searchResults = {
            job_type: JOB_TYPE,
            searchDate: searchDate,
            jobs: [],
        };

        // collecting actual response data for debug purposes
        let actualResponseData = [];

        let requestedPage = RequestOptions?.requestedPage || 1;
        let insertedCount = 0;
        let lastDataSize = 0;

        try {
            // Single request with multiple pages (num_pages = 10 for 2x cost efficiency)
            let data = await this.RequestSender.sendRequest(
                JOB_TYPE,
                requestedPage,
                NUM_PAGES,
                RequestOptions
            );

            lastDataSize = data?.data?.length || 0;

            insertedCount += await this.insertJobs(
                data.data,
                JOB_TYPE,
                data.language
            );

            if (process.env.LOG_LEVEL === "debug")
                actualResponseData.push(data);

            searchResults.jobs = searchResults.jobs.concat(data.data);

            if (!searchResults?.location) searchResults.location = data?.parameters?.country;
            if (!searchResults?.language) searchResults.language = data?.parameters?.language;

        } catch (error) {
            error.availableItems = lastDataSize;
            throw error
        } finally {
            await this.logResults(searchResults);

            if (process.env.LOG_LEVEL === "debug")
                await this.logFullResponse(JOB_TYPE, searchDate, actualResponseData);

            Logger.info(
                `${DATA_PROVIDER} - Collected: ${
                    searchResults.jobs.length
                } and inserted ${insertedCount} duplicates:${
                    searchResults.jobs.length - insertedCount
                } to DB by JobType: ${JOB_TYPE} Location:${
                    searchResults.location
                } Language:${searchResults.language}`
            );
        }

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
    async collectList(JobTypes, RequestOptions) {
        const results = [];
        for (const job_type of JobTypes) {
            const tempRes = await this.collect(job_type, RequestOptions);
            results.push({job_type: job_type, response: tempRes});
        }

        return results;
    }

    async insertJobs(jobs, job_type, language) {
        return await this.JobPostHandler.insertList(
            jobs,
            job_type,
            language
        );
    }
}

module.exports = Collector;