const axios = require('axios');
const Logger = require("../Loggers/CollectorLogger");
const AdzunaCollectionError = require("../Errors/AdzunaCollectionError");
const {getCountryCode} = require("../Utils/LanguageUtils");

class AdzunaRequestSender {
    static DATA_PROVIDER = "Adzuna";
    static API_URL = "https://api.adzuna.com/v1/api/jobs";
    static APP_ID = process.env.ADZUNA_APP_ID;

    constructor(apiKey) {
        this.API_KEY = apiKey;
    }

    setApiKey(apiKey) {
        this.API_KEY = apiKey;
    }

    buildParams(jobType, requestedPage, options = {}) {
        const {
            country = getCountryCode(process.env.API_LANGUAGE),
            location = "",
        } = options;

        const params = {
            app_id: AdzunaRequestSender.APP_ID,
            app_key: this.API_KEY
        };

        if (jobType) params.what = jobType;
        if (location) params.where = location;

        return { params, country };
    }

    async sendRequest(jobType, requestedPage = 1, options = {}) {
        const { params, country } = this.buildParams(jobType, requestedPage, options);
        const url = `${AdzunaRequestSender.API_URL}/${country}/search/${requestedPage}/?${new URLSearchParams(params)}`;

        try {
            Logger.debug(`${AdzunaRequestSender.DATA_PROVIDER}: Sending request to: ${url}`);
            const response = await axios.get(url);
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
        return new AdzunaCollectionError(`${AdzunaRequestSender.DATA_PROVIDER} Error: ${error.message}`, {
            status: error?.response?.status,
            jobType: jobType,
            requestedPage: requestedPage,
            originalError: error
        });
    }

}

module.exports = AdzunaRequestSender;