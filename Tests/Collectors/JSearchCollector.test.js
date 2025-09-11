
const Collector = require("../../src/DataCollector/Collectors/JSearchCollector");
const RequestSender = require("../../src/DataCollector/RequestSenders/JSearchRequestSender");
const JobPostHandler = require("../../src/DataCollector/Handlers/JobPostHandler");
const JobPostService = require("../../src/Services/JobPostService");
// const RapidAPIConverter = require("../../src/DataCollector/Converters/RapidAPIConverter");
const ResultLogger = require("../../src/DataCollector/Loggers/ResultsLogger");
const axios = require("axios");

require("dotenv").config();

// Mock axios
jest.mock("axios");

const mockJSearchResponse = {
    data: [
        {
            job_id: "test-job-1",
            employer_name: "Test Company",
            job_title: "Software Engineer",
            job_description: "Test job description",
            job_apply_link: "https://example.com/apply",
            job_city: "Test City",
            job_country: "US",
            job_posted_at_datetime_utc: "2025-01-01T00:00:00.000Z",
            employer_logo: "https://example.com/logo.png"
        },
        {
            job_id: "test-job-2",
            employer_name: "Another Company",
            job_title: "Frontend Developer",
            job_description: "Another test job description",
            job_apply_link: "https://example.com/apply2",
            job_city: "Another City",
            job_country: "US",
            job_posted_at_datetime_utc: "2025-01-02T00:00:00.000Z",
            employer_logo: "https://example.com/logo2.png"
        },
        {
            job_id: "test-job-1",
            employer_name: "Test Company",
            job_title: "Software Engineer",
            job_description: "Test job description",
            job_apply_link: "https://example.com/apply",
            job_city: "Test City",
            job_country: "US",
            job_posted_at_datetime_utc: "2025-01-01T00:00:00.000Z",
            employer_logo: "https://example.com/logo.png"
        },
        {
            job_id: "test-job-2",
            employer_name: "Another Company",
            job_title: "Frontend Developer",
            job_description: "Another test job description",
            job_apply_link: "https://example.com/apply2",
            job_city: "Another City",
            job_country: "US",
            job_posted_at_datetime_utc: "2025-01-02T00:00:00.000Z",
            employer_logo: "https://example.com/logo2.png"
        },
        {
            job_id: "test-job-1",
            employer_name: "Test Company",
            job_title: "Software Engineer",
            job_description: "Test job description",
            job_apply_link: "https://example.com/apply",
            job_city: "Test City",
            job_country: "US",
            job_posted_at_datetime_utc: "2025-01-01T00:00:00.000Z",
            employer_logo: "https://example.com/logo.png"
        },
        {
            job_id: "test-job-2",
            employer_name: "Another Company",
            job_title: "Frontend Developer",
            job_description: "Another test job description",
            job_apply_link: "https://example.com/apply2",
            job_city: "Another City",
            job_country: "US",
            job_posted_at_datetime_utc: "2025-01-02T00:00:00.000Z",
            employer_logo: "https://example.com/logo2.png"
        },
        {
            job_id: "test-job-1",
            employer_name: "Test Company",
            job_title: "Software Engineer",
            job_description: "Test job description",
            job_apply_link: "https://example.com/apply",
            job_city: "Test City",
            job_country: "US",
            job_posted_at_datetime_utc: "2025-01-01T00:00:00.000Z",
            employer_logo: "https://example.com/logo.png"
        },
        {
            job_id: "test-job-2",
            employer_name: "Another Company",
            job_title: "Frontend Developer",
            job_description: "Another test job description",
            job_apply_link: "https://example.com/apply2",
            job_city: "Another City",
            job_country: "US",
            job_posted_at_datetime_utc: "2025-01-02T00:00:00.000Z",
            employer_logo: "https://example.com/logo2.png"
        },
        {
            job_id: "test-job-1",
            employer_name: "Test Company",
            job_title: "Software Engineer",
            job_description: "Test job description",
            job_apply_link: "https://example.com/apply",
            job_city: "Test City",
            job_country: "US",
            job_posted_at_datetime_utc: "2025-01-01T00:00:00.000Z",
            employer_logo: "https://example.com/logo.png"
        },
        {
            job_id: "test-job-2",
            employer_name: "Another Company",
            job_title: "Frontend Developer",
            job_description: "Another test job description",
            job_apply_link: "https://example.com/apply2",
            job_city: "Another City",
            job_country: "US",
            job_posted_at_datetime_utc: "2025-01-02T00:00:00.000Z",
            employer_logo: "https://example.com/logo2.png"
        }
    ],
    parameters: {
        query: "Software Engineer",
        page: 1,
        country: "US",
        language: "en_US"
    }
};

const mockJSearchResponse2 = {
    data: [
        {
            job_id: "test-job-3",
            employer_name: "Third Company",
            job_title: "Backend Engineer",
            job_description: "Third test job description",
            job_apply_link: "https://example.com/apply3",
            job_city: "Third City",
            job_country: "US",
            job_posted_at_datetime_utc: "2025-01-03T00:00:00.000Z",
            employer_logo: "https://example.com/logo3.png"
        }
    ],
    parameters: {
        query: "Software Engineer",
        page: 2,
        country: "US",
        language: "en_US"
    }
};

describe("Collector: ", () => {
    beforeEach(() => jest.restoreAllMocks());

    it('Should send 2 requests to JSearch', async () => {
        // Mock the axios.request method
        axios.request
            .mockResolvedValueOnce({ data: mockJSearchResponse })
            .mockResolvedValueOnce({ data: mockJSearchResponse2 });

        // Mock the JobPostHandler methods
        const mockJobPostHandler = {
            insertList: jest.fn().mockResolvedValue(2)
        };

        // Mock ResultLogger methods
        jest.spyOn(ResultLogger, "logResultsToJSONFile").mockImplementation(() => Promise.resolve());

        // Create instances
        const requestSender = new RequestSender("test-api-key");
        const collector = new Collector(requestSender, mockJobPostHandler);

        // Mock the logging methods
        jest.spyOn(collector, "logResults").mockImplementation(() => Promise.resolve());
        jest.spyOn(collector, "logFullResponse").mockImplementation(() => Promise.resolve());


        const jobType = "Software Engineer";

        // Execute the test
        const result = await collector.collect(jobType);

        // Verify axios.request was called twice
        expect(axios.request).toHaveBeenCalledTimes(1);

        // Verify JobPostHandler.insertList was called
        expect(mockJobPostHandler.insertList).toHaveBeenCalledTimes(2);
    });
});