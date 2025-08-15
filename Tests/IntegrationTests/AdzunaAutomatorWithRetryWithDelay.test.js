const mongoose = require("mongoose");
const AdzunaCollector = require("../../src/DataCollector/Collectors/AdzunaCollector");
const RetryWithDelay = require("../../src/DataCollector/ErrorHandlingStrategies/RetryWithDelay");
const axios = require("axios");
const DataProviderService = require("../../src/Services/DataProviderService");
const AdzunaRequestSender = require("../../src/DataCollector/RequestSenders/AdzunaRequestSender");
const JobPostHandler = require("../../src/DataCollector/Handlers/JobPostHandler");
const AdzunaConverter = require("../../src/DataCollector/Converters/AdzunaConverter");
const JobPostService = require("../../src/Services/JobPostService");
const AdzunaAutomator = require("../../src/DataCollector/Automators/AdzunaAutomator");

jest.mock("axios");

const response_example = {
    mean: 56641.73,
    results: [
        {
            id: "5345357427",
            title: "Software Engineer",
            description: "Ciao Network!  Sono alla ricerca attiva di un SENIOR FULL STACK, freelance da inserire su un nostro cliente finale in ambito Healthcare in Italia. Lingua Parlata nel progetto Italiano. MUST! Skills tecniche richieste: -BACK END: Node.js possibilmente con Nest.js -FRONT END: Vue.js o React.js con TypeScript -DATABASE utilizzati: MongoDB, PostgreSQL -Metodologia di lavoro \u00e8 Agile/Scrum, si lavora ad obbiettivi. Andrai a lavorare in un team di persone altamente qualificate. La persona ideale \u00e8 un \u2026",
            adref: "eyJhbGciOiJIUzI1NiJ9.eyJzIjoiTXFkMXRqaDE4Qkdaai1IdGc1SFZuUSIsImkiOiI1MzQ1MzU3NDI3In0._PLUun0tOGYaQKC9DQRP6ZoLCgdor0rNl8LilElHEoQ",
            company: {
                display_name: "Tenth Revolution Group"
            },
            location: {
                display_name: "Italia",
                area: ["Italia"]
            },
            redirect_url: "https://www.adzuna.it/land/ad/5345357427?se=Mqd1tjh18BGZj-Htg5HVnQ&utm_medium=api&utm_source=03484920&v=14149A09DB3CAFD9D8A8496C71E3F7813057BC7F",
            category: {
                tag: "unknown",
                label: "Unknown",
            },
            created: "2025-08-09T13:54:44Z",
            salary_is_predicted: "0"
        }
    ],
    count: 0,
};

describe("RapidAPIAutomator Integration Tests", () => {

    describe("RetryHandler Integration Tests", () => {
        let automator;
        let collector;
        const jobTypesList = ["Software Engineer"];
        const options = {
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

            await DataProviderService.create(AdzunaRequestSender.DATA_PROVIDER);

            const sender = new AdzunaRequestSender();
            const handler = new JobPostHandler(AdzunaConverter, JobPostService);
            collector = new AdzunaCollector(sender, handler);
            const retryHandler = new RetryWithDelay();

            automator = new AdzunaAutomator(
                new Set(["test-key1", "test-key2"]),
                sender,
                collector,
                retryHandler,
            );

            jest.resetAllMocks();

            jest.spyOn(collector, "logFullResponse")
                .mockImplementation(async () => Promise.resolve());
            jest.spyOn(collector, "logResults")
                .mockImplementation(async () => Promise.resolve());


        });

        it("should handle multiple job types with partial failures", async () => {
            const multiJobTypesList = ["Software Engineer", "Developer"];

            axios.get
                .mockResolvedValueOnce({data: response_example}) // First job type succeeds
                .mockRejectedValueOnce({response: {status: 500}}) // Second job type fails first try
                .mockResolvedValueOnce({data: {...response_example, job_type: "Developer"}}); // Second job type succeeds on retry

            const results = await automator.automate(multiJobTypesList, options);

            expect(results.length).toBe(2);
            expect(await JobPostService.getAll()).toHaveLength(1);
            expect(axios.get).toHaveBeenCalledTimes(3);
        }, 20000);

        it("should handle key rotation on rate limit errors", async () => {
            axios.get
                .mockRejectedValueOnce({response: {status: 429}}) // First key rate limited
                .mockResolvedValueOnce({data: response_example}); // Second key works

            const results = await automator.automate(jobTypesList, options);

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

            axios.get
                .mockRejectedValueOnce({
                    response: {status: 500},
                    jobType: jobTypesList[0],
                    requestedPage: "page1",
                    receivedItems: 15
                })
                .mockResolvedValueOnce({data: response_example});

            await automator.automate(jobTypesList, optionsWithPage);

            // The requestedPage should be preserved during retries
            expect(optionsWithPage.requestedPage).toBe("");
        });

        it("should handle multiple consecutive errors before success", async () => {
            axios.get
                .mockRejectedValueOnce({response: {status: 500}})
                .mockRejectedValueOnce({response: {status: 502}})
                .mockRejectedValueOnce({response: {status: 503}})
                .mockResolvedValueOnce({data: response_example});

            const results = await automator.automate(jobTypesList, options);

            expect(results.length).toBe(1);
            expect(await JobPostService.getAll()).toHaveLength(1);
            expect(axios.get).toHaveBeenCalledTimes(4);
        });

        it("should handle all keys being invalidated", async () => {
            axios.get
                .mockRejectedValueOnce({response: {status: 401}}) // First key invalid
                .mockRejectedValueOnce({response: {status: 401}}); // Second key invalid

            const results = await automator.automate(jobTypesList, options);

            expect(results).toEqual([]);
            expect(automator.keys.size).toBe(0);
            expect(await JobPostService.getAll()).toHaveLength(0);
        });

        it("should respect maximum retries even with valid keys", async () => {
            // Mock 6 consecutive 500 errors (exceeding 5 retries)
            for (let i = 0; i < 6; i++) {
                axios.get.mockRejectedValueOnce({
                    response: {status: 500},
                    message: `Attempt ${i + 1} failed`
                });
            }

            await expect(automator.automate(jobTypesList, options))
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

            await DataProviderService.create(AdzunaRequestSender.DATA_PROVIDER);

            now = Date.now();
            jest.spyOn(Date, 'now').mockImplementation(() => now);

            const sender = new AdzunaRequestSender();
            const handler = new JobPostHandler(AdzunaConverter, JobPostService);
            collector = new AdzunaCollector(sender, handler);
            const retryHandler = new RetryWithDelay(3, [], null, 5000); // 5 second window

            automator = new AdzunaAutomator(
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
            axios.get
                .mockRejectedValueOnce({response: {status: 500}})
                .mockRejectedValueOnce({response: {status: 500}})
                .mockRejectedValueOnce({response: {status: 500}});

            await expect(automator.automate(["Software Engineer"], options)).rejects.toThrow();
            expect(automator.retryHandler.consecutiveErrors).toBe(3);

            // Advance time beyond error window
            now += 7000;

            // Next job types should start with fresh error count
            axios.get
                .mockResolvedValueOnce({data: {...response_example, job_type: "Developer"}})
                .mockResolvedValueOnce({data: {...response_example, job_type: "Data Scientist"}});

            const results = await automator.automate(["Developer", "Data Scientist"], options);
            expect(results.length).toBe(2);
        });

        it("should accumulate errors across job types within window", async () => {
            // First job type fails
            axios.get
                .mockRejectedValueOnce({response: {status: 500}})
                .mockRejectedValueOnce({response: {status: 500}});

            await expect(automator.automate(["Software Engineer"], options))
                .rejects
                .toThrow();

            // Small time advancement (within window)
            now += 2000;

            // Second job type should consider previous errors
            axios.get
                .mockRejectedValueOnce({response: {status: 500}});

            await expect(automator.automate(["Developer"], options))
                .rejects
                .toThrow('Maximum retries');

            expect(automator.retryHandler.consecutiveErrors).toBe(4);
        });

        it("should handle mixed success/failure patterns with error window", async () => {
            // First request succeeds
            axios.get
                .mockResolvedValueOnce({data: response_example});

            await automator.automate(["Software Engineer"], options);
            expect(automator.retryHandler.consecutiveErrors).toBe(0);

            // Move forward in time but stay within window
            now += 2000;

            // Next requests fail
            axios.get
                .mockRejectedValueOnce({response: {status: 500}})
                .mockRejectedValueOnce({response: {status: 500}});

            await expect(automator.automate(["Developer"], options))
                .rejects
                .toThrow();

            expect(automator.retryHandler.consecutiveErrors).toBe(3);

            // Move beyond error window
            now += 6000;

            // Should start fresh
            axios.get
                .mockResolvedValueOnce({data: response_example});

            const results = await automator.automate(["Data Scientist"], options);
            expect(results.length).toBe(1);
            expect(automator.retryHandler.consecutiveErrors).toBe(0);
        });

        it("should handle error window with key rotation", async () => {
            // First key gets rate limited
            axios.get
                .mockRejectedValueOnce({response: {status: 429}});

            await expect(automator.automate(jobTypesList, options)).rejects.toThrow();
            expect(automator.keys.has("test-key1")).toBe(false);

            // Within error window, second key works
            now += 2000;

            axios.get
                .mockResolvedValueOnce({data: response_example});

            const results = await automator.automate(jobTypesList, options);
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
            axios.get
                .mockRejectedValueOnce({response: {status: 500}})
                .mockRejectedValueOnce({response: {status: 500}});

            await expect(automator.automate(jobTypesList, optionsWithPagination))
                .rejects
                .toThrow();

            // Next page within error window
            now += 1000;
            optionsWithPagination.requestedPage = "page2";

            axios.get
                .mockRejectedValueOnce({response: {status: 500}});

            await expect(automator.automate(jobTypesList, optionsWithPagination))
                .rejects
                .toThrow('Maximum retries');

            expect(automator.retryHandler.consecutiveErrors).toBe(4);
        });
    });
})
