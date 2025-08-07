const axios = require('axios');
const Logger = require("../Loggers/CollectorLogger");

class AdzunaRequestSender {
    static DATA_PROVIDER = "Adzuna";
    static API_URL = "https://api.adzuna.com/v1/api/jobs";
    static APP_ID = process.env.ADZUNA_APP_ID;
    static API_KEY = process.env.ADZUNA_API_KEY;

    constructor(apiKey) {
        this.apiKey = apiKey;
    }

    setApiKey(apiKey) {
        this.apiKey = apiKey;
    }

    buildUrl(jobType, requestedPage, options = {}) {
        const {
            country = "gb",
            location = "",
            salaryMin = "",
            salaryMax = "",
            sortBy = "",
            resultsPerPage = "",
            distance = "",
            company = ""
        } = options;

        // Base URL with country
        let url = `${AdzunaRequestSender.API_URL}/${country}/search/1`;

        // Build query parameters
        const params = new URLSearchParams();

        // Required parameters
        params.append('app_id', AdzunaRequestSender.APP_ID);
        params.append('app_key', AdzunaRequestSender.API_KEY);

        // Page parameter
        if (requestedPage) {
            params.append('page', requestedPage);
        }

        // Job search parameters
        if (jobType) {
            params.append('what', jobType);
        }

        if (location) {
            params.append('where', location);
        }

        if (salaryMin) {
            params.append('salary_min', salaryMin);
        }

        if (salaryMax) {
            params.append('salary_max', salaryMax);
        }

        if (sortBy) {
            params.append('sort_by', sortBy);
        }

        if (resultsPerPage) {
            params.append('results_per_page', resultsPerPage);
        }

        if (distance) {
            params.append('distance', distance);
        }

        if (company) {
            params.append('company', company);
        }

        return `${url}?${params.toString()}`;
    }

    buildParams(jobType, requestedPage, options = {}) {
        const {
            country = "gb",
            location = "",
            salaryMin = "",
            salaryMax = "",
            sortBy = "",
            resultsPerPage = "",
            distance = "",
            company = ""
        } = options;

        const params = {
            app_id: AdzunaRequestSender.APP_ID,
            app_key: AdzunaRequestSender.API_KEY,
            country
        };

        if (requestedPage) params.page = requestedPage;
        if (jobType) params.what = jobType;
        if (location) params.where = location;
        if (salaryMin) params.salary_min = salaryMin;
        if (salaryMax) params.salary_max = salaryMax;
        if (sortBy) params.sort_by = sortBy;
        if (resultsPerPage) params.results_per_page = resultsPerPage;
        if (distance) params.distance = distance;
        if (company) params.company = company;

        return params;
    }

    buildRequestOptions(params) {
        const { country, ...queryParams } = params;

        return {
            method: "GET",
            url: `${AdzunaRequestSender.API_URL}/${country}/search/1`,
            params: queryParams,
            headers: {
                'Content-Type': 'application/json'
            }
        };
    }

    async sendRequest(jobType, requestedPage = "", options = {}) {
        const params = this.buildParams(jobType, requestedPage, options);
        const requestOptions = this.buildRequestOptions(params);

        try {
            Logger.debug(`${AdzunaRequestSender.DATA_PROVIDER}: Sending request with params: ${JSON.stringify(params)}`);
            const response = await axios.request(requestOptions);
            return this.formatResponse(response?.data, jobType, params.where, params.country);
        } catch (error) {
            console.log(error)
            Logger.error(`${AdzunaRequestSender.DATA_PROVIDER}: Receiving : ${JSON.stringify(error)}`);
            if (error.response) {
                throw this.formatError(error, jobType, requestedPage);
            }
            throw error;
        }
    }

    formatResponse(data, jobType, location, country) {
        return {
            ...data,
            location,
            country,
            job_type: jobType,
            data_provider: AdzunaRequestSender.DATA_PROVIDER,
        };
    }

    formatError(error, jobType, requestedPage) {
        return new Error(`${AdzunaRequestSender.DATA_PROVIDER} Error: ${error.message}`, {
            status: error?.response?.status,
            jobType: jobType,
            requestedPage: requestedPage,
            originalError: error
        });
    }
}

module.exports = AdzunaRequestSender;