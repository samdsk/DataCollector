const axios = require("axios");
require("dotenv").config();


class RapidAPIRequestSender_v02 {
    static DATA_PROVIDER = "RapidAPI_v02";
    static API_URL = "https://jobs-api14.p.rapidapi.com/v2/list";
    static API_HOST = "jobs-api14.p.rapidapi.com"

    constructor(API_KEY) {
        this.API_KEY = API_KEY || process.env.API_KEY;
    }

    async sendRequest(JobType, requestedPage = "", optionalParams) {
        const location = optionalParams?.location || process.env.API_LOCATION;
        const language = optionalParams?.language || process.env.API_LANGUAGE;
        const employmentTypes =
            optionalParams?.employmentTypes || "fulltime;parttime;intern;contractor";

        const requestOptions = {
            method: "GET",
            url: RapidAPIRequestSender_v02.API_URL,
            params: {
                query: JobType,
                location: location,
                autoTranslate: false,
                remoteOnly: false,
                employmentTypes: employmentTypes,
                acceptLanguage: language
            },
            headers: {
                "X-RapidAPI-Key": this.API_KEY,
                "X-RapidAPI-Host": RapidAPIRequestSender_v02.API_HOST,
            }
        }

        if (requestedPage !== "") {
            requestOptions.params.nextPage = requestedPage;
        }

        try {
            const response = await axios.request(requestOptions);
            response.data.location = location;
            response.data.language = language;
            response.data.job_type = JobType;
            response.data.data_provider = RapidAPIRequestSender_v02.DATA_PROVIDER;

            return response.data;
        } catch (error) {
            if (error.response) {
                throw {
                    status: error.response.status,
                    jobType: JobType,
                    requestedPage: requestedPage,
                    error: error,
                };
            } else throw error;
        }

    }
}

module.exports = RapidAPIRequestSender_v02;

