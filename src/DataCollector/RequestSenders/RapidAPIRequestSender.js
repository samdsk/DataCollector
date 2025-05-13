const axios = require("axios");
require("dotenv").config();


/**
 * @param {string} API_KEY Rapid API KEY
 * @param {Object} [options] optional parameters
 * @param {string} options.API_URL RapidAPI URL if not provided will be taken from environment variable
 * @param {string} options.API_HOST RapidAPI HOST URL if not provided will be taken from environment variable
 */
class RapidAPIRequestSender {
    static DATA_PROVIDER = "RapidAPI";

    constructor(API_KEY, options) {
        this.API_KEY = API_KEY || process.env.API_KEY;
        this.API_URL = options?.API_URL || process.env.API_URL;
        this.API_HOST = options?.API_HOST || process.env.API_HOST;
    }

    /**
     * Sends a Job Search request to Rapid API's Job search API
     * @param {string} JobType
     * @param {number} [index] = 0
     * @param {object} [optionalParams] Optional Parameters
     * @param {string} optionalParams.location location from where to start the job search
     * @param {string} optionalParams.language language of job posts (not guaranteed), default = it_IT
     * @param {string} optionalParams.datePosted specifies time period. Default = month. Allowed values: month, week, today, 3days
     * @param {string} optionalParams.employmentTypes specifies employment types. Default = "fulltime;parttime;intern;contractor". Allowed values: contractor, fulltime, parttime, intern
     * @returns {axios.response.data} data object of axios response object containing array of found jobs, index, jobCount, hasError and errors
     */
    async sendRequest(JobType, index = 0, optionalParams) {
        const location = optionalParams?.location || process.env.API_LOCATION;
        const language = optionalParams?.language || process.env.API_LANGUAGE;
        const datePosted = optionalParams?.datePosted || "month";
        const employmentTypes =
            optionalParams?.employmentTypes || "fulltime;parttime;intern;contractor";

        const requestOptions = {
            method: "GET",
            url: this.API_URL,
            params: {
                query: JobType,
                location: location,
                language: language,
                datePosted: datePosted,
                employmentTypes: employmentTypes,
                index: index,
            },
            headers: {
                "X-RapidAPI-Key": this.API_KEY,
                "X-RapidAPI-Host": this.API_HOST,
            },
        };

        try {
            const response = await axios.request(requestOptions);
            response.data.location = location;
            response.data.language = language;
            response.data.job_type = JobType;
            response.data.data_provider = RapidAPIRequestSender.DATA_PROVIDER;

            return response.data;
        } catch (error) {
            if (error.response) {
                throw {
                    status: error.response.status,
                    jobType: JobType,
                    index: index,
                    error: error,
                };
            } else throw error;
        }
    }
}

module.exports = RapidAPIRequestSender;
