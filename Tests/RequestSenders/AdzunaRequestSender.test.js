const AdzunaRequestSender = require("../../src/DataCollector/RequestSenders/AdzunaRequestSender");
const axios = require("axios");
const AdzunaCollectionError = require("../../src/DataCollector/Errors/AdzunaCollectionError");
require("dotenv").config();
jest.mock('axios');
const mockedAxios = axios;

describe("AdzunaRequestSender tests", () => {
    let adzunaRequestSender;
    const mockApiKey = "test_api_key";

    // Mock response data
    const mockResponseData = {
        "mean": 56641.73,
        "results": [
            {
                "id": "5345357427",
                "title": "Software Engineer",
                "description": "Ciao Network!  Sono alla ricerca attiva di un SENIOR FULL STACK, freelance da inserire su un nostro cliente finale in ambito Healthcare in Italia. Lingua Parlata nel progetto Italiano. MUST! Skills tecniche richieste: -BACK END: Node.js possibilmente con Nest.js -FRONT END: Vue.js o React.js con TypeScript -DATABASE utilizzati: MongoDB, PostgreSQL -Metodologia di lavoro è Agile/Scrum, si lavora ad obbiettivi. Andrai a lavorare in un team di persone altamente qualificate. La persona ideale è un …",
                "adref": "eyJhbGciOiJIUzI1NiJ9.eyJzIjoiTXFkMXRqaDE4Qkdaai1IdGc1SFZuUSIsImkiOiI1MzQ1MzU3NDI3In0._PLUun0tOGYaQKC9DQRP6ZoLCgdor0rNl8LilElHEoQ",
                "company": {
                    "__CLASS__": "Adzuna::API::Response::Company",
                    "display_name": "Tenth Revolution Group"
                },
                "location": {
                    "__CLASS__": "Adzuna::API::Response::Location",
                    "display_name": "Italia",
                    "area": ["Italia"]
                },
                "__CLASS__": "Adzuna::API::Response::Job",
                "redirect_url": "https://www.adzuna.it/land/ad/5345357427?se=Mqd1tjh18BGZj-Htg5HVnQ&utm_medium=api&utm_source=03484920&v=14149A09DB3CAFD9D8A8496C71E3F7813057BC7F",
                "category": {
                    "tag": "unknown",
                    "label": "Unknown",
                    "__CLASS__": "Adzuna::API::Response::Category"
                },
                "created": "2025-08-09T13:54:44Z",
                "salary_is_predicted": "0"
            }
        ],
        "count": 10,
        "__CLASS__": "Adzuna::API::Response::JobSearchResults"
    };

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
        // Setup default mock implementations
        adzunaRequestSender = new AdzunaRequestSender(mockApiKey);
    });


    describe("Constructor and API key management", () => {
        it("should create instance with api key", () => {
            const sender = new AdzunaRequestSender(mockApiKey);
            expect(sender.API_KEY).toBe(mockApiKey);
        });

        it("should set api key using setApiKey method", () => {
            const newApiKey = "new_test_api_key";
            adzunaRequestSender.setApiKey(newApiKey);
            expect(adzunaRequestSender.API_KEY).toBe(newApiKey);
        });
    });

    describe("buildParams", () => {
        it("should build basic parameters with job type", () => {
            const jobType = "Software Engineer";
            const { params, country } = adzunaRequestSender.buildParams(jobType, 1);

            expect(params).toEqual({
                app_id: AdzunaRequestSender.APP_ID,
                app_key: mockApiKey,
                what: jobType
            });
            expect(country).toBe("it");
        });

        it("should build parameters with location", () => {
            const jobType = "Developer";
            const options = { country: "us", location:"New York" };
            const { params, country } = adzunaRequestSender.buildParams(jobType, 1, options);

            expect(params).toEqual({
                app_id: AdzunaRequestSender.APP_ID,
                app_key: mockApiKey,
                what: jobType,
                where: "New York"
            });
            expect(country).toBe("us");
        });

        it("should build parameters with custom country", () => {
            const jobType = "Engineer";
            const options = { country: "gb" };
            const { params, country } = adzunaRequestSender.buildParams(jobType, 1, options);

            expect(params).toEqual({
                app_id: AdzunaRequestSender.APP_ID,
                app_key: mockApiKey,
                what: jobType
            });
            expect(country).toBe("gb");
        });

        it("should not include what parameter if jobType is null or empty", () => {
            const { params } = adzunaRequestSender.buildParams("", 1);
            expect(params).not.toHaveProperty("what");

            const { params: params2 } = adzunaRequestSender.buildParams(null, 1);
            expect(params2).not.toHaveProperty("what");
        });
    });

    describe("sendRequest - Success cases", () => {
        it("should send request successfully and return formatted response", async () => {
            // Mock successful axios response
            mockedAxios.get.mockResolvedValue({
                data: mockResponseData
            });

            const jobType = "Software Engineer";
            const result = await adzunaRequestSender.sendRequest(jobType);

            expect(mockedAxios.get).toHaveBeenCalledWith(
                expect.stringContaining("https://api.adzuna.com/v1/api/jobs/it/search/1/")
            );

            expect(result).toEqual({
                ...mockResponseData,
                location: "Italy",
                language: "it_IT",
                job_type: jobType,
                data_provider: "Adzuna"
            });
        });

        it("should send request with custom page number", async () => {
            mockedAxios.get.mockResolvedValue({ data: mockResponseData });

            const jobType = "Developer";
            const requestedPage = 5;
            await adzunaRequestSender.sendRequest(jobType, requestedPage);

            expect(mockedAxios.get).toHaveBeenCalledWith(
                expect.stringContaining("/search/5/")
            );
        });

        it("should send request with location parameter", async () => {
            mockedAxios.get.mockResolvedValue({ data: mockResponseData });

            const jobType = "Engineer";
            const options = { location: "London" };
            await adzunaRequestSender.sendRequest(jobType, 1, options);

            expect(mockedAxios.get).toHaveBeenCalledWith(
                expect.stringContaining("where=London")
            );
        });

        it("should send request with custom country", async () => {
            mockedAxios.get.mockResolvedValue({ data: mockResponseData });

            const jobType = "Developer";
            const options = { country: "ca" };
            await adzunaRequestSender.sendRequest(jobType, 1, options);

            expect(mockedAxios.get).toHaveBeenCalledWith(
                expect.stringContaining("/jobs/ca/search/")
            );
        });
    });

    describe("sendRequest - Error cases", () => {
        it("should handle HTTP error responses and throw AdzunaCollectionError", async () => {
            const errorResponse = {
                response: {
                    status: 400,
                    data: { error: "Bad Request" }
                },
                message: "Request failed with status code 400"
            };

            mockedAxios.get.mockRejectedValue(errorResponse);

            const jobType = "Software Engineer";
            const requestedPage = 1;

            await expect(adzunaRequestSender.sendRequest(jobType, requestedPage))
                .rejects.toThrow(AdzunaCollectionError);
        });

        it("should handle network errors and rethrow them", async () => {
            const networkError = new Error("Network Error");
            mockedAxios.get.mockRejectedValue(networkError);

            const jobType = "Developer";

            await expect(adzunaRequestSender.sendRequest(jobType))
                .rejects.toThrow("Network Error");
        });

        it("should handle 401 unauthorized error", async () => {
            const unauthorizedError = {
                response: {
                    status: 401,
                    data: { error: "Unauthorized" }
                },
                message: "Request failed with status code 401"
            };

            mockedAxios.get.mockRejectedValue(unauthorizedError);

            const jobType = "Engineer";
            const requestedPage = 2;

            await expect(adzunaRequestSender.sendRequest(jobType, requestedPage))
                .rejects.toThrow(AdzunaCollectionError);
        });

        it("should handle 429 rate limit error", async () => {
            const rateLimitError = {
                response: {
                    status: 429,
                    data: { error: "Too Many Requests" }
                },
                message: "Request failed with status code 429"
            };

            mockedAxios.get.mockRejectedValue(rateLimitError);

            const jobType = "Data Scientist";

            await expect(adzunaRequestSender.sendRequest(jobType))
                .rejects.toThrow(AdzunaCollectionError);
        });
    });

    describe("formatResponse", () => {
        it("should format response with additional metadata", () => {
            const jobType = "Software Engineer";
            const location = "San Francisco";
            const country = "us";

            const formatted = adzunaRequestSender.formatResponse(
                mockResponseData,
                jobType,
                location,
                country
            );

            expect(formatted).toEqual({
                ...mockResponseData,
                location: "Italy", // From process.env.API_LOCATION
                language: "it_IT", // From process.env.API_LANGUAGE
                job_type: jobType,
                data_provider: "Adzuna"
            });
        });
    });

    describe("formatError", () => {
        it("should format error as AdzunaCollectionError", () => {
            const originalError = {
                message: "API Error",
                response: {
                    status: 500
                }
            };
            const jobType = "Developer";
            const requestedPage = 3;

            const formattedError = adzunaRequestSender.formatError(
                originalError,
                jobType,
                requestedPage
            );

            expect(formattedError).toBeInstanceOf(AdzunaCollectionError);
            expect(formattedError.message).toBe("Adzuna Error: API Error");
            expect(formattedError.status).toEqual(500);
        });
    });

    describe("Integration with environment variables", () => {
        it("should use environment variables correctly", () => {
            const originalLanguage = process.env.API_LANGUAGE;
            const originalLocation = process.env.API_LOCATION;

            process.env.API_LANGUAGE = "it";
            process.env.API_LOCATION = "Milano";

            mockedAxios.get.mockResolvedValue({ data: mockResponseData });

            return adzunaRequestSender.sendRequest("Developer").then(result => {
                expect(result.language).toBe("it");
                expect(result.location).toBe("Milano");

                // Restore original values
                process.env.API_LANGUAGE = originalLanguage;
                process.env.API_LOCATION = originalLocation;
            });
        });
    });
});