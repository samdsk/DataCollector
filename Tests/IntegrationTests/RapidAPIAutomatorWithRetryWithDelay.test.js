const mongoose = require("mongoose");
const RapidAPICollector = require("../../src/DataCollector/Collectors/RapidAPICollector");
const RetryWithDelay = require("../../src/DataCollector/CollectorErrorHandler/RetryWithDelay");
const axios = require("axios");
const DataProviderService = require("../../src/Services/DataProviderService");
const RapidAPIRequestSender_v02 = require("../../src/DataCollector/RequestSenders/RapidAPIRequestSender_v02");
const JobPostHandler = require("../../src/DataCollector/Handlers/JobPostHandler");
const RapidAPIConverter = require("../../src/DataCollector/Converters/RapidAPIConverter");
const JobPostService = require("../../src/Services/JobPostService");
const RapidAPIAutomator = require("../../src/DataCollector/Automators/RapidAPIAutomator");

jest.mock("axios");

const response_example = {
    jobs: [{
        id: "UyxvLGYsdCx3LGEscixlLCAsRSxuLGcsaSxuLGUsZSxyLCwsICxKLHUsbixpLG8scixCLG8sbyx6LCA=",
        title: "Software Engineer, Junior",
        company: "Test Company",
        description: "Test Description",
        location: "Roma RM, Italia",
        employmentType: "Full-time e Part-time",
        datePosted: "2 giorni fa",
        jobProviders: [{
            jobProvider: "Test Provider",
            url: "https://test.com"
        }]
    }],
    language: "it_IT",
    job_type: "Software Engineer",
    data_provider: RapidAPIRequestSender_v02.DATA_PROVIDER,
    index: 0,
    jobCount: 1,
    nextPage: "nextpage",
    hasError: false,
    errors: []
};
describe("RapidAPIAutomator Integration Tests", () => {

    describe("RetryHandler Integration Tests", () => {
        let automator;
        let collector;
        const jobTypesList = ["Software Engineer"];
        const options = {
            location: "Italia",
            language: "it_IT"
        };

        beforeAll(async () => {
            await mongoose.connect(process.env.DB_URL_TEST);
        });

        afterAll(async () => {
            await mongoose.connection.close();
        });

        beforeEach(async () => {
            const collections = await mongoose.connection.db.collections();
            for (const collection of collections) {
                await collection.drop();
            }

            await DataProviderService.create(RapidAPIRequestSender_v02.DATA_PROVIDER);

            const sender = new RapidAPIRequestSender_v02();
            const handler = new JobPostHandler(RapidAPIConverter, JobPostService);
            collector = new RapidAPICollector(sender, handler);
            const retryHandler = new RetryWithDelay();

            automator = new RapidAPIAutomator(
                new Set(["test-key1", "test-key2"]),
                sender,
                collector,
                retryHandler,
                {API_URL: "test-url", API_HOST: "test-host"}
            );

            jest.resetAllMocks();

            jest.spyOn(collector, "logFullResponse")
                .mockImplementation(async () => Promise.resolve());
            jest.spyOn(collector, "logResults")
                .mockImplementation(async () => Promise.resolve());


        });

        it("should handle multiple job types with partial failures", async () => {
            const multiJobTypesList = ["Software Engineer", "Developer"];

            axios.request
                .mockResolvedValueOnce({data: response_example}) // First job type succeeds
                .mockRejectedValueOnce({response: {status: 500}}) // Second job type fails first try
                .mockResolvedValueOnce({data: {...response_example, job_type: "Developer"}}); // Second job type succeeds on retry

            const results = await automator.collect(multiJobTypesList, options);

            expect(results.length).toBe(2);
            expect(await JobPostService.getAll()).toHaveLength(1);
            expect(axios.request).toHaveBeenCalledTimes(3);
        });

        it("should handle key rotation on rate limit errors", async () => {
            axios.request
                .mockRejectedValueOnce({response: {status: 429}}) // First key rate limited
                .mockResolvedValueOnce({data: response_example}); // Second key works

            const results = await automator.collect(jobTypesList, options);

            expect(results.length).toBe(1);
            expect(automator.keys.has("test-key1")).toBe(false); // First key should be removed
            expect(automator.keys.has("test-key2")).toBe(true);
            expect(await JobPostService.getAll()).toHaveLength(1);
        });

        it("should preserve pagination state during retries", async () => {
            const optionsWithPage = {
                ...options,
                requestedPage: "page1"
            };

            axios.request
                .mockRejectedValueOnce({
                    response: {status: 500},
                    jobType: jobTypesList[0],
                    requestedPage: "page1",
                    receivedItems: 15
                })
                .mockResolvedValueOnce({data: response_example});

            await automator.collect(jobTypesList, optionsWithPage);

            // The requestedPage should be preserved during retries
            expect(optionsWithPage.requestedPage).toBe("");
        });

        it("should handle multiple consecutive errors before success", async () => {
            axios.request
                .mockRejectedValueOnce({response: {status: 500}})
                .mockRejectedValueOnce({response: {status: 502}})
                .mockRejectedValueOnce({response: {status: 503}})
                .mockResolvedValueOnce({data: response_example});

            const results = await automator.collect(jobTypesList, options);

            expect(results.length).toBe(1);
            expect(await JobPostService.getAll()).toHaveLength(1);
            expect(axios.request).toHaveBeenCalledTimes(4);
        });

        it("should handle all keys being invalidated", async () => {
            axios.request
                .mockRejectedValueOnce({response: {status: 401}}) // First key invalid
                .mockRejectedValueOnce({response: {status: 401}}); // Second key invalid

            const results = await automator.collect(jobTypesList, options);

            expect(results).toEqual([]);
            expect(automator.keys.size).toBe(0);
            expect(await JobPostService.getAll()).toHaveLength(0);
        });

        it("should respect maximum retries even with valid keys", async () => {
            // Mock 6 consecutive 500 errors (exceeding 5 retries)
            for (let i = 0; i < 6; i++) {
                axios.request.mockRejectedValueOnce({
                    response: {status: 500},
                    message: `Attempt ${i + 1} failed`
                });
            }

            await expect(automator.collect(jobTypesList, options))
                .rejects
                .toThrow('Maximum retries of 5 have been reached');

            expect(await JobPostService.getAll()).toHaveLength(0);
            expect(automator.keys.size).toBe(2); // Keys should be preserved for 500 errors
        }, 20000);
    });

    describe("Error Window Integration Tests", () => {
        let automator;
        let collector;
        let now;
        const jobTypesList = ["Software Engineer"];
        const options = {
            location: "Italia",
            language: "it_IT"
        };

        beforeAll(async () => {
            await mongoose.connect(process.env.DB_URL_TEST);
        });

        afterAll(async () => {
            await mongoose.connection.close();
        });

        beforeEach(async () => {
            const collections = await mongoose.connection.db.collections();
            for (const collection of collections) {
                await collection.drop();
            }

            await DataProviderService.create(RapidAPIRequestSender_v02.DATA_PROVIDER);

            now = Date.now();
            jest.spyOn(Date, 'now').mockImplementation(() => now);

            const sender = new RapidAPIRequestSender_v02();
            const handler = new JobPostHandler(RapidAPIConverter, JobPostService);
            collector = new RapidAPICollector(sender, handler);
            const retryHandler = new RetryWithDelay(3, [], null, 5000); // 5 second window

            automator = new RapidAPIAutomator(
                new Set(["test-key1", "test-key2"]),
                sender,
                collector,
                retryHandler,
                {API_URL: "test-url", API_HOST: "test-host"}
            );

            jest.spyOn(collector, "logFullResponse")
                .mockImplementation(async () => Promise.resolve());
            jest.spyOn(collector, "logResults")
                .mockImplementation(async () => Promise.resolve());
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it("should reset error count after window expiration with different job types", async () => {
            const multiJobTypesList = ["Software Engineer", "Developer", "Data Scientist"];

            // First job type - causes errors
            axios.request
                .mockRejectedValueOnce({response: {status: 500}})
                .mockRejectedValueOnce({response: {status: 500}})
                .mockRejectedValueOnce({response: {status: 500}});

            await expect(automator.collect(["Software Engineer"], options)).rejects.toThrow();
            expect(automator.retryHandler.consecutiveErrors).toBe(3);

            // Advance time beyond error window
            now += 7000;

            // Next job types should start with fresh error count
            axios.request
                .mockResolvedValueOnce({data: {...response_example, job_type: "Developer"}})
                .mockResolvedValueOnce({data: {...response_example, job_type: "Data Scientist"}});

            const results = await automator.collect(["Developer", "Data Scientist"], options);
            expect(results.length).toBe(2);
        });

        it("should accumulate errors across job types within window", async () => {
            // First job type fails
            axios.request
                .mockRejectedValueOnce({response: {status: 500}})
                .mockRejectedValueOnce({response: {status: 500}});

            await expect(automator.collect(["Software Engineer"], options))
                .rejects
                .toThrow();

            // Small time advancement (within window)
            now += 2000;

            // Second job type should consider previous errors
            axios.request
                .mockRejectedValueOnce({response: {status: 500}});

            await expect(automator.collect(["Developer"], options))
                .rejects
                .toThrow('Maximum retries');

            expect(automator.retryHandler.consecutiveErrors).toBe(4);
        });

        it("should handle mixed success/failure patterns with error window", async () => {
            // First request succeeds
            axios.request
                .mockResolvedValueOnce({data: response_example});

            await automator.collect(["Software Engineer"], options);
            expect(automator.retryHandler.consecutiveErrors).toBe(0);

            // Move forward in time but stay within window
            now += 2000;

            // Next requests fail
            axios.request
                .mockRejectedValueOnce({response: {status: 500}})
                .mockRejectedValueOnce({response: {status: 500}});

            await expect(automator.collect(["Developer"], options))
                .rejects
                .toThrow();

            expect(automator.retryHandler.consecutiveErrors).toBe(3);

            // Move beyond error window
            now += 6000;

            // Should start fresh
            axios.request
                .mockResolvedValueOnce({data: response_example});

            const results = await automator.collect(["Data Scientist"], options);
            expect(results.length).toBe(1);
            expect(automator.retryHandler.consecutiveErrors).toBe(0);
        });

        it("should handle error window with key rotation", async () => {
            // First key gets rate limited
            axios.request
                .mockRejectedValueOnce({response: {status: 429}});

            await expect(automator.collect(jobTypesList, options)).rejects.toThrow();
            expect(automator.keys.has("test-key1")).toBe(false);

            // Within error window, second key works
            now += 2000;

            axios.request
                .mockResolvedValueOnce({data: response_example});

            const results = await automator.collect(jobTypesList, options);
            expect(results.length).toBe(1);
            expect(automator.keys.has("test-key2")).toBe(true);
            expect(automator.retryHandler.consecutiveErrors).toBe(3);
        });

        it("should properly track errors across pagination requests within window", async () => {
            const optionsWithPagination = {
                ...options,
                requestedPage: "page1"
            };

            // First page request fails
            axios.request
                .mockRejectedValueOnce({response: {status: 500}})
                .mockRejectedValueOnce({response: {status: 500}});

            await expect(automator.collect(jobTypesList, optionsWithPagination))
                .rejects
                .toThrow();

            // Next page within error window
            now += 1000;
            optionsWithPagination.requestedPage = "page2";

            axios.request
                .mockRejectedValueOnce({response: {status: 500}});

            await expect(automator.collect(jobTypesList, optionsWithPagination))
                .rejects
                .toThrow('Maximum retries');

            expect(automator.retryHandler.consecutiveErrors).toBe(4);
        });
    });
})
