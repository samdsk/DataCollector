const Collector = require("../../src/DataCollector/Collectors/AdzunaCollector");
const ResultLogger = require("../../src/DataCollector/Loggers/ResultsLogger");

require("dotenv").config();

const adzuna_response_example = {
    results: [
        {
            id: "adzuna_12345",
            title: "Software Engineer",
            company: {
                display_name: "Tech Company Ltd"
            },
            location: {
                display_name: "New York, NY"
            },
            description: "We are looking for a skilled Software Engineer to join our team...",
            redirect_url: "https://www.adzuna.com/job/12345",
            created: "2025-08-14T10:00:00Z"
        }
    ],
    count: 0,
    location: "New York",
    language: "en_US",
    job_type: "Software Engineer",
    data_provider: "Adzuna"
};

const adzuna_response_example_page2 = {
    results: [
        {
            id: "adzuna_67890",
            title: "Senior Software Engineer",
            company: {
                display_name: "Innovation Corp"
            },
            location: {
                display_name: "San Francisco, CA"
            },
            description: "Senior position for experienced software engineer...",
            redirect_url: "https://www.adzuna.com/job/67890",
            created: "2025-08-14T09:00:00Z"
        }
    ],
    count: 0,
    location: "San Francisco",
    language: "en_US",
    job_type: "Software Engineer",
    data_provider: "Adzuna"
};

describe("AdzunaCollector Unit Tests:", () => {
    let collector;
    let mockRequestSender;
    let mockJobPostHandler;
    let mockDate;

    beforeEach(() => {
        // Mock dependencies
        mockRequestSender = {
            sendRequest: jest.fn()
        };

        mockJobPostHandler = {
            insertList: jest.fn()
        };

        collector = new Collector(mockRequestSender, mockJobPostHandler);

        // Mock static date for consistent testing
        mockDate = new Date('2025-08-14T12:00:00Z');
        jest.spyOn(global.Date, 'now').mockImplementation(() => mockDate.getTime());

        // Mock loggers
        jest.spyOn(ResultLogger, 'logResultsToJSONFile').mockResolvedValue();
    });

    afterEach(() => {
        jest.restoreAllMocks();
        jest.clearAllMocks();
    });

    describe("collect method", () => {
        it("should successfully collect jobs from single page", async () => {
            const jobType = "Software Engineer";
            const expectedInsertedCount = 1;

            mockRequestSender.sendRequest.mockResolvedValueOnce(adzuna_response_example);
            mockJobPostHandler.insertList.mockResolvedValueOnce(expectedInsertedCount);

            const result = await collector.collect(jobType);

            expect(mockRequestSender.sendRequest).toHaveBeenCalledWith(jobType, 1, undefined);
            expect(mockJobPostHandler.insertList).toHaveBeenCalledWith(
                adzuna_response_example.results,
                jobType,
                adzuna_response_example.language
            );

            expect(result).toEqual({
                job_type: jobType,
                searchDate: mockDate,
                collected: 1,
                inserted: expectedInsertedCount,
                location: adzuna_response_example.location,
                language: adzuna_response_example.language
            });

            expect(ResultLogger.logResultsToJSONFile).toHaveBeenCalledWith(
                `results_${jobType}`,
                mockDate,
                expect.objectContaining({
                    job_type: jobType,
                    searchDate: mockDate,
                    jobs: adzuna_response_example.results
                })
            );
        });

        it("should collect jobs from multiple pages", async () => {
            const jobType = "Software Engineer";
            process.env.REQUEST_LIMIT = "3";

            mockRequestSender.sendRequest
                .mockResolvedValueOnce({...adzuna_response_example, count: 1})
                .mockResolvedValueOnce(adzuna_response_example_page2);

            mockJobPostHandler.insertList
                .mockResolvedValueOnce(1)
                .mockResolvedValueOnce(1);

            const result = await collector.collect(jobType);

            expect(mockRequestSender.sendRequest).toHaveBeenCalledTimes(2);
            expect(mockRequestSender.sendRequest).toHaveBeenNthCalledWith(1, jobType, 1, undefined);
            expect(mockRequestSender.sendRequest).toHaveBeenNthCalledWith(2, jobType, 2, undefined);

            expect(result.collected).toBe(2);
            expect(result.inserted).toBe(2);
        });

        it("should respect REQUEST_LIMIT environment variable", async () => {
            const jobType = "Software Engineer";
            process.env.REQUEST_LIMIT = "1";

            mockRequestSender.sendRequest.mockResolvedValueOnce(adzuna_response_example);
            mockJobPostHandler.insertList.mockResolvedValueOnce(1);

            await collector.collect(jobType);

            expect(mockRequestSender.sendRequest).toHaveBeenCalledTimes(1);
        });

        it("should handle RequestOptions parameter", async () => {
            const jobType = "Software Engineer";
            const requestOptions = {
                requestedPage: 2,
                country: "us",
                location: "New York"
            };

            mockRequestSender.sendRequest.mockResolvedValueOnce(adzuna_response_example);
            mockJobPostHandler.insertList.mockResolvedValueOnce(1);

            await collector.collect(jobType, requestOptions);

            expect(mockRequestSender.sendRequest).toHaveBeenCalledWith(jobType, 2, requestOptions);
        });

        it("should log full response when LOG_LEVEL is debug", async () => {
            const jobType = "Software Engineer";

            mockRequestSender.sendRequest.mockResolvedValueOnce(adzuna_response_example);
            mockJobPostHandler.insertList.mockResolvedValueOnce(1);

            jest.spyOn(collector, 'logFullResponse').mockResolvedValue();

            await collector.collect(jobType);

            expect(collector.logFullResponse).toHaveBeenCalledWith(
                jobType,
                mockDate,
                [adzuna_response_example]
            );
        });

        it("should handle errors and still log results", async () => {
            const jobType = "Software Engineer";
            const error = new Error("API request failed");
            error.availableItems = undefined;

            mockRequestSender.sendRequest.mockRejectedValueOnce(error);

            try {
                await collector.collect(jobType);
            } catch (thrownError) {
                expect(thrownError).toBe(error);
                expect(thrownError.availableItems).toBe(0); // jobCount default value
            }

            expect(ResultLogger.logResultsToJSONFile).toHaveBeenCalled();
        });

        it("should stop collecting when jobCount reaches 0", async () => {
            const jobType = "Software Engineer";
            const emptyResponse = { ...adzuna_response_example, count: 0, results: [] };

            mockRequestSender.sendRequest
                .mockResolvedValueOnce({...adzuna_response_example, count: 10})
                .mockResolvedValueOnce(emptyResponse);

            mockJobPostHandler.insertList
                .mockResolvedValueOnce(1)
                .mockResolvedValueOnce(0);

            await collector.collect(jobType);

            expect(mockRequestSender.sendRequest).toHaveBeenCalledTimes(2);
        });
    });

    describe("collectList method", () => {
        it("should collect jobs for multiple job types", async () => {
            const jobTypes = ["Software Engineer", "Data Scientist"];
            const requestOptions = { location: "New York" };

            mockRequestSender.sendRequest
                .mockResolvedValueOnce(adzuna_response_example)
                .mockResolvedValueOnce({ ...adzuna_response_example, job_type: "Data Scientist" });

            mockJobPostHandler.insertList
                .mockResolvedValueOnce(1)
                .mockResolvedValueOnce(1);

            const results = await collector.collectList(jobTypes, requestOptions);

            expect(results).toHaveLength(2);
            expect(results[0].job_type).toBe("Software Engineer");
            expect(results[1].job_type).toBe("Data Scientist");

            expect(mockRequestSender.sendRequest).toHaveBeenCalledTimes(2);
        });

        it("should handle empty job types array", async () => {
            const jobTypes = [];
            const results = await collector.collectList(jobTypes);

            expect(results).toEqual([]);
            expect(mockRequestSender.sendRequest).not.toHaveBeenCalled();
        });
    });

    describe("insertJobs method", () => {
        it("should call JobPostHandler.insertList with correct parameters", async () => {
            const jobs = adzuna_response_example.results;
            const jobType = "Software Engineer";
            const language = "en_US";
            const expectedResult = 1;

            mockJobPostHandler.insertList.mockResolvedValueOnce(expectedResult);

            const result = await collector.insertJobs(jobs, jobType, language);

            expect(mockJobPostHandler.insertList).toHaveBeenCalledWith(jobs, jobType, language);
            expect(result).toBe(expectedResult);
        });
    });

    describe("logging methods", () => {
        it("should log results to JSON file", async () => {
            const results = {
                job_type: "Software Engineer",
                searchDate: mockDate,
                jobs: adzuna_response_example.results
            };

            await collector.logResults(results);

            expect(ResultLogger.logResultsToJSONFile).toHaveBeenCalledWith(
                `results_${results.job_type}`,
                results.searchDate,
                results
            );
        });

        it("should log full response to JSON file", async () => {
            const jobType = "Software Engineer";
            const date = mockDate;
            const response = [adzuna_response_example];

            await collector.logFullResponse(jobType, date, response);

            expect(ResultLogger.logResultsToJSONFile).toHaveBeenCalledWith(
                `full_response_${jobType}`,
                date,
                response
            );
        });
    });
});