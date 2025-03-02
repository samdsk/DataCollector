// Automate.integration.test.js

const Automate = require("../../Library/Automators/RapidAPIAutomator"); // Adjust path as needed
const Collector = require("../../Library/Collectors/RapidAPICollector");

// We'll also spy on Logger (if needed) to verify debug/info messages.
// const Logger = require("../../Library/");

// Mock Collector so that when Automate creates a new instance, we control its behavior.
jest.mock("../../Library/Collectors/RapidAPICollector");

describe("Integration tests for Automate.collect()", () => {
    let automate;
    let collectorMock;

    const initialKeys = ["key1", "key2", "key3"];

    beforeEach(() => {
        // Create a new Automate instance with a Set of keys.
        automate = new Automate(new Set(initialKeys), {});
        automate.init();

        // Create a fresh mock for Collector.searchJobsByType.
        collectorMock = {
            searchJobsByType: jest.fn(),
        };

        // When Automate creates a new Collector instance, return our mock.
        Collector.mockImplementation(() => collectorMock);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("should successfully collect all job types when all requests succeed", async () => {
        collectorMock.searchJobsByType
            .mockResolvedValueOnce({job_type: "job1", collected: 5})
            .mockResolvedValueOnce({job_type: "job2", collected: 6});

        const options = {};
        const jobTypesList = ["job1", "job2"];

        const results = await automate.collect(jobTypesList, options);

        expect(results).toEqual([
            {job_type: "job1", collected: 5},
            {job_type: "job2", collected: 6},
        ]);
        expect(options.requestedPage).toBe(""); // should be reset after each job type
    });

    test("should preserve requestedPage if error occurs and the error job type is the next one", async () => {
        // First call for "job1" fails with a 400 error but with enough items,
        // so nextPage is preserved. Then a retry for "job1" succeeds.
        const error = {status: 400, jobType: "job1", requestedPage: "page2", receivedItems: 12};
        collectorMock.searchJobsByType
            .mockRejectedValueOnce(error) // First attempt for job1 fails
            .mockResolvedValueOnce({job_type: "job1", collected: 10}) // Retry for job1 succeeds
            .mockResolvedValueOnce({job_type: "job2", collected: 8}); // Then job2 succeeds

        const options = {};
        const jobTypesList = ["job1", "job2"];

        const results = await automate.collect(jobTypesList, options);

        expect(results).toEqual([
            {job_type: "job1", collected: 10},
            {job_type: "job2", collected: 8},
        ]);
        // When processing a new job type, requestedPage should be reset.
        expect(options.requestedPage).toBe("");
    });

    test("should reset requestedPage and slice jobTypesList if error job type is not the next one", async () => {
        // "job1" succeeds, but then "job2" fails.
        collectorMock.searchJobsByType
            .mockResolvedValueOnce({job_type: "job1", collected: 5})
            .mockRejectedValueOnce({status: 400, jobType: "job2", requestedPage: "page3", receivedItems: 8})
            .mockResolvedValueOnce({job_type: "job2", collected: 7}) // Retry for job2 after slicing
            .mockResolvedValueOnce({job_type: "job3", collected: 9});

        const options = {};
        let jobTypesList = ["job1", "job2", "job3"];

        const results = await automate.collect(jobTypesList, options);

        expect(results).toEqual([
            {job_type: "job1", collected: 5},
            {job_type: "job2", collected: 7},
            {job_type: "job3", collected: 9},
        ]);
        expect(options.requestedPage).toBe("");
    });

    test("should remove an invalid key and retry with the next key", async () => {
        // When processing "job1", key "key1" is invalid (status 401).
        const error = {status: 401, jobType: "job1", requestedPage: "page1", receivedItems: 15};
        collectorMock.searchJobsByType
            .mockRejectedValueOnce(error) // First attempt with key "key1" fails.
            .mockResolvedValueOnce({job_type: "job1", collected: 10}); // Then, with next key, it succeeds.

        const options = {};
        const jobTypesList = ["job1"];
        automate.keys = new Set(["key1", "key2"]); // Start with two keys

        const results = await automate.collect(jobTypesList, options);

        expect(results).toEqual([{job_type: "job1", collected: 10}]);
        expect(automate.keys.has("key1")).toBe(false); // key1 removed
        expect(automate.keys.has("key2")).toBe(true);
    });

    test("should propagate unexpected errors", async () => {
        // If an error with an unexpected status occurs, it should be rethrown.
        const error = {status: 500, jobType: "job1", requestedPage: "", receivedItems: 0};
        collectorMock.searchJobsByType.mockRejectedValueOnce(error);

        const options = {};
        const jobTypesList = ["job1"];

        await expect(automate.collect(jobTypesList, options)).rejects.toEqual(error);
    });

    test("should return empty results when jobTypesList is empty", async () => {
        const options = {};
        const jobTypesList = [];
        const results = await automate.collect(jobTypesList, options);
        expect(results).toEqual([]);
    });

    test("should return empty results when keys set is empty", async () => {
        const options = {};
        const jobTypesList = ["job1", "job2"];
        automate.keys = new Set(); // No available keys
        const results = await automate.collect(jobTypesList, options);
        expect(results).toEqual([]);
    });

    test("should handle consecutive errors on the same job type then eventually succeed", async () => {
        // Simulate job1 failing twice then succeeding,
        // and job2 then succeeding.
        const error1 = {status: 400, jobType: "job1", requestedPage: "page2", receivedItems: 5}; // receivedItems low so nextPage resets
        collectorMock.searchJobsByType
            .mockRejectedValueOnce(error1) // first error for job1 (jobTypesList[0] equals error.jobType → pagination resets)
            .mockResolvedValueOnce({job_type: "job1", collected: 10}) // retry for job1
            .mockResolvedValueOnce({job_type: "job2", collected: 8});

        const options = {requestedPage: "page1"};
        const jobTypesList = ["job1", "job2"];

        const results = await automate.collect(jobTypesList, options);

        expect(results).toEqual([
            {job_type: "job1", collected: 10},
            {job_type: "job2", collected: 8},
        ]);
        expect(options.requestedPage).toBe("");
    });

    test("should try multiple keys until success for the same job type", async () => {
        // For job1, key1 fails (403), key2 fails (429), then key3 works.
        const errorKey1 = {status: 403, jobType: "job1", requestedPage: "page1", receivedItems: 20};
        const errorKey2 = {status: 429, jobType: "job1", requestedPage: "page1", receivedItems: 20};
        collectorMock.searchJobsByType
            .mockRejectedValueOnce(errorKey1)  // First call fails with key1.
            .mockRejectedValueOnce(errorKey2)  // Next call fails with key2.
            .mockResolvedValueOnce({job_type: "job1", collected: 12}); // Finally, with key3, job1 succeeds.

        const options = {};
        const jobTypesList = ["job1"];

        // Set keys in order: key1, key2, key3.
        automate.keys = new Set(["key1", "key2", "key3"]);

        const results = await automate.collect(jobTypesList, options);

        expect(results).toEqual([{job_type: "job1", collected: 12}]);
        expect(automate.keys.has("key1")).toBe(false);
        expect(automate.keys.has("key2")).toBe(false);
        expect(automate.keys.has("key3")).toBe(true);
    });
});
