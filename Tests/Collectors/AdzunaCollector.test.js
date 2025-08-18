
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
    count: 100, // Fixed count that doesn't decrease
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
    count: 100, // Same fixed count as page 1
    location: "San Francisco",
    language: "en_US",
    job_type: "Software Engineer",
    data_provider: "Adzuna"
};

const adzuna_empty_response = {
    results: [],
    count: 100, // Count stays the same even when no more results
    location: "New York",
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

            mockRequestSender.sendRequest.mockResolvedValueOnce({...adzuna_response_example, count: 1});
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
                language: adzuna_response_example.language,
                totalAvailable: 1,
                receivedTotal: 1,
                pagesProcessed: 1
            });
        });

        it("should collect jobs from multiple pages with fixed count", async () => {
            const jobType = "Software Engineer";
            process.env.REQUEST_LIMIT = "3";

            // Simulate multiple pages with fixed count
            mockRequestSender.sendRequest
                .mockResolvedValueOnce(adzuna_response_example) // Page 1: 1 result
                .mockResolvedValueOnce(adzuna_response_example_page2) // Page 2: 1 result
                .mockResolvedValueOnce(adzuna_empty_response); // Page 3: 0 results

            mockJobPostHandler.insertList
                .mockResolvedValueOnce(1)
                .mockResolvedValueOnce(1)
                .mockResolvedValueOnce(0);

            const result = await collector.collect(jobType);

            expect(mockRequestSender.sendRequest).toHaveBeenCalledTimes(3);
            expect(mockRequestSender.sendRequest).toHaveBeenNthCalledWith(1, jobType, 1, undefined);
            expect(mockRequestSender.sendRequest).toHaveBeenNthCalledWith(2, jobType, 2, undefined);
            expect(mockRequestSender.sendRequest).toHaveBeenNthCalledWith(3, jobType, 3, undefined);

            expect(result.collected).toBe(2);
            expect(result.inserted).toBe(2);
            expect(result.totalAvailable).toBe(100);
            expect(result.receivedTotal).toBe(2);
            expect(result.pagesProcessed).toBe(3);
        });

        it("should stop when reaching total available jobs despite fixed count", async () => {
            const jobType = "Software Engineer";
            const smallCountResponse = { ...adzuna_response_example, count: 2 }; // Only 2 jobs available

            mockRequestSender.sendRequest
                .mockResolvedValueOnce(smallCountResponse) // Page 1: 1 result out of 2 total
                .mockResolvedValueOnce({...smallCountResponse, results: [adzuna_response_example_page2.results[0]]}); // Page 2: 1 result

            mockJobPostHandler.insertList
                .mockResolvedValueOnce(1)
                .mockResolvedValueOnce(1);

            const result = await collector.collect(jobType);

            expect(mockRequestSender.sendRequest).toHaveBeenCalledTimes(2);
            expect(result.collected).toBe(2);
            expect(result.totalAvailable).toBe(2);
            expect(result.receivedTotal).toBe(2); // Collected all available jobs
        });

        it("should handle large count with pagination stopping at empty results", async () => {
            const jobType = "Software Engineer";
            const largeCountResponse = { ...adzuna_response_example, count: 1000 }; // 1000 jobs available

            mockRequestSender.sendRequest
                .mockResolvedValueOnce(largeCountResponse) // Page 1: 1 result
                .mockResolvedValueOnce(adzuna_response_example_page2) // Page 2: 1 result
                .mockResolvedValueOnce(adzuna_empty_response); // Page 3: 0 results (no more data)

            mockJobPostHandler.insertList
                .mockResolvedValueOnce(1)
                .mockResolvedValueOnce(1)
                .mockResolvedValueOnce(0);

            const result = await collector.collect(jobType);

            expect(mockRequestSender.sendRequest).toHaveBeenCalledTimes(3);
            expect(result.collected).toBe(2); // Only got 2 results despite 1000 being available
            expect(result.totalAvailable).toBe(100); // Last response count
            expect(result.receivedTotal).toBe(2);
        });

        it("should handle RequestOptions parameter", async () => {
            const jobType = "Software Engineer";
            const requestOptions = {
                requestedPage: 2,
                country: "us",
                location: "New York"
            };

            mockRequestSender.sendRequest.mockResolvedValueOnce({...adzuna_response_example, count : 1});
            mockJobPostHandler.insertList.mockResolvedValueOnce(1);

            await collector.collect(jobType, requestOptions);

            expect(mockRequestSender.sendRequest).toHaveBeenCalledWith(jobType, 2, requestOptions);
        });

        it("should handle errors and include pagination context with fixed count", async () => {
            const jobType = "Software Engineer";
            const error = new Error("API request failed");

            // First request succeeds, second fails
            mockRequestSender.sendRequest
                .mockResolvedValueOnce(adzuna_response_example) // Page 1 succeeds
                .mockRejectedValueOnce(error); // Page 2 fails

            mockJobPostHandler.insertList.mockResolvedValueOnce(1);

            try {
                await collector.collect(jobType);
            } catch (thrownError) {
                expect(thrownError).toBe(error);
                expect(thrownError.availableItems).toBe(100); // Fixed count from first successful request
                expect(thrownError.receivedItems).toBe(1); // Received from first page
                expect(thrownError.currentPage).toBe(2); // Failed on page 2
            }
        });

        it("should stop collecting when no more results despite fixed count showing availability", async () => {
            const jobType = "Software Engineer";
            const responseWithJobs = { ...adzuna_response_example, count: 1000 };
            const emptyResponseWithFixedCount = { ...adzuna_empty_response, count: 1000 };

            mockRequestSender.sendRequest
                .mockResolvedValueOnce(responseWithJobs) // Page 1: has results
                .mockResolvedValueOnce(emptyResponseWithFixedCount); // Page 2: no results but count still 1000

            mockJobPostHandler.insertList
                .mockResolvedValueOnce(1)
                .mockResolvedValueOnce(0);

            const result = await collector.collect(jobType);

            expect(mockRequestSender.sendRequest).toHaveBeenCalledTimes(2);
            expect(result.collected).toBe(1); // Only 1 job actually collected
            expect(result.totalAvailable).toBe(1000); // Fixed count from API
            expect(result.receivedTotal).toBe(1); // Total jobs actually received across all pages
        });
    });

    describe("collectList method", () => {
        it("should collect jobs for multiple job types", async () => {
            const jobTypes = ["Software Engineer", "Data Scientist"];
            const requestOptions = { location: "New York" };

            mockRequestSender.sendRequest
                .mockResolvedValueOnce({...adzuna_response_example, count : 1})
                .mockResolvedValueOnce({ ...adzuna_response_example, job_type: "Data Scientist", count : 1 });

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
});