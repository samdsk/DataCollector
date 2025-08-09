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

    buildParams(jobType, requestedPage, options = {}) {
        const {
            country = "it",
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
            app_key: AdzunaRequestSender.API_KEY
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

        return { params, country };
    }

    async sendRequest(jobType, requestedPage = 1, options = {}) {
        const { params, country } = this.buildParams(jobType, requestedPage, options);
        const url = `${AdzunaRequestSender.API_URL}/${country}/search/${requestedPage}`;

        try {
            Logger.debug(`${AdzunaRequestSender.DATA_PROVIDER}: Sending request to: ${url}`);
            Logger.debug(`${AdzunaRequestSender.DATA_PROVIDER}: With params: ${JSON.stringify(params)}`);

            const response = await axios.get(url, {
                params: params,
                headers: {
                    'Accept': 'application/json'
                }
            });

            return this.formatResponse(response?.data, jobType, params.where, country);
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
            location: process.env.API_LOCATION,
            language: process.env.API_LANGUAGE,
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