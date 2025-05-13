const axios = require("axios");
require("dotenv").config();
const Logger = require("../Loggers/CollectorLogger");

class RapidAPIRequestSender_v02 {
    static DATA_PROVIDER = "RapidAPI_v02";
    static API_URL = "https://jobs-api14.p.rapidapi.com/v2/list";
    static API_HOST = "jobs-api14.p.rapidapi.com"

    constructor(apiKey) {
        this.apiKey = apiKey;
    }

    setApiKey(apiKey) {
        this.apiKey = apiKey;
    }

    /**
     * Build the query parameters for the API request.
     *
     * @param {string} jobType - The job type query.
     * @param {string} requestedPage - The pagination token (if any).
     * @param {Object} options - Optional parameters.
     * @returns {Object} The request query parameters.
     */
    buildParams(jobType, requestedPage = "", {
        location = process.env.API_LOCATION,
        language = process.env.API_LANGUAGE,
        employmentTypes = "fulltime;parttime;intern;contractor"
    } = {}) {
        return {
            query: jobType,
            location,
            autoTranslate: false,
            remoteOnly: false,
            employmentTypes,
            acceptLanguage: language,
            ...(requestedPage && {nextPage: requestedPage})
        };
    }

    /**
     * Build the complete request options object.
     *
     * @param {Object} params - The query parameters.
     * @returns {Object} The request options.
     */
    buildRequestOptions(params) {
        return {
            method: "GET",
            url: RapidAPIRequestSender_v02.API_URL,
            params,
            headers: {
                "X-RapidAPI-Key": this.apiKey,
                "X-RapidAPI-Host": RapidAPIRequestSender_v02.API_HOST,
            }
        };
    }

    /**
     * Format the API response by injecting additional context.
     *
     * @param {Object} data - The raw response data.
     * @param {string} jobType - The job type query.
     * @param {string} location - The location used in the request.
     * @param {string} language - The language used in the request.
     * @returns {Object} The formatted response data.
     */
    formatResponse(data, jobType, location, language) {
        return {
            ...data,
            location,
            language,
            job_type: jobType,
            data_provider: RapidAPIRequestSender_v02.DATA_PROVIDER,
        };
    }

    /**
     * Format and enrich an error with additional properties.
     *
     * @param {Error} error - The original error.
     * @param {string} jobType - The job type that triggered the error.
     * @param {string} requestedPage - The pagination token used in the request.
     * @returns {Error} The enriched error.
     */
    formatError(error, jobType, requestedPage) {
        const formattedError = new Error(error.message);
        formattedError.status = error?.response?.status;
        formattedError.jobType = jobType;
        formattedError.requestedPage = requestedPage;
        formattedError.originalError = error;
        return formattedError;
    }

    /**
     * Sends a GET request to the RapidAPI endpoint.
     *
     * @param {string} jobType - The job type query.
     * @param {string} [requestedPage=""] - Pagination token if available.
     * @param {Object} [options={}] - Optional parameters.
     * @returns {Promise<Object>} The response data.
     * @throws {Error} Throws an enriched error on request failure.
     */
    async sendRequest(jobType, requestedPage = "", options = {}) {
        const params = this.buildParams(jobType, requestedPage, options);
        const requestOptions = this.buildRequestOptions(params);

        try {
            Logger.debug(`${RapidAPIRequestSender_v02.DATA_PROVIDER}: Sending request with params: ${JSON.stringify(params)}`);
            const response = await axios.request(requestOptions);
            return this.formatResponse(response.data, jobType, params.location, params.acceptLanguage);
        } catch (error) {
            console.log(error)
            Logger.error(`${RapidAPIRequestSender_v02.DATA_PROVIDER}: Receiving : ${JSON.stringify(error)}`);
            if (error.response) {
                throw this.formatError(error, jobType, requestedPage);
            }
            throw error;
        }
    }
}

module.exports = RapidAPIRequestSender_v02;

