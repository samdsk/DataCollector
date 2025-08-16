
const AdzunaRequestSender = require('../../src/DataCollector/RequestSenders/AdzunaRequestSender');
const AdzunaCollector = require('../../src/DataCollector/Collectors/AdzunaCollector');
const JobPostHandler = require("../../src/DataCollector/Handlers/JobPostHandler");
const AdzunaConverter = require("../../src/DataCollector/Converters/AdzunaConverter");
const { connect, close, clearDatabase } = require("../db_handler");
const JobPostService = require("../../src/Services/JobPostService.js");
const DataProviderService = require("../../src/Services/DataProviderService");

require('dotenv').config();

describe('Adzuna API E2E Tests', () => {
    let requestSender;
    const delete_list = ["texts"];

    beforeAll(async () => {
        await connect();
        await DataProviderService.create(AdzunaRequestSender.DATA_PROVIDER);
        requestSender = new AdzunaRequestSender(process.env.ADZUNA_API_KEY);
    });

    afterAll(async () => {
        await close();
    });

    afterEach(async () => {
        await clearDatabase(delete_list);
    });

    describe('Paging Tests', () => {
        test('should retrieve first page successfully', async () => {
            const jobType = 'software developer';
            const page = 1;

            const response = await requestSender.sendRequest(jobType, page);

            console.log(response);

            expect(response).toBeDefined();
            expect(response.results).toBeDefined();
            expect(Array.isArray(response.results)).toBe(true);
            expect(response.results.length).toBeGreaterThan(0);
            expect(response.count).toBeDefined();
            expect(typeof response.count).toBe('number');
        });
    });

    describe('Count Parameter Tests', () => {
        test('should respect results_per_page parameter with small count', async () => {
            const jobType = 'software developer';

            const sender = new AdzunaRequestSender(process.env.ADZUNA_API_KEY);
            const handler = new JobPostHandler(AdzunaConverter, JobPostService);
            const collector = new AdzunaCollector(sender, handler);

            const response = await collector.collect(jobType);

            console.log(response);
        });

    });
    //
    // describe('Combined Paging and Count Tests', () => {
    //     test('should handle paging with different count parameters', async () => {
    //         const jobType = 'software developer';
    //         const count = 3;
    //         const options = { results_per_page: count };
    //
    //         const page1Response = await requestSender.sendRequest(jobType, 1, options);
    //         const page2Response = await requestSender.sendRequest(jobType, 2, options);
    //
    //         // Both pages should respect the count parameter
    //         expect(page1Response.results.length).toBeLessThanOrEqual(count);
    //         expect(page2Response.results.length).toBeLessThanOrEqual(count);
    //
    //         // Both should have the same total count
    //         expect(page1Response.count).toBe(page2Response.count);
    //
    //         // Results should be different between pages
    //         if (page1Response.results.length > 0 && page2Response.results.length > 0) {
    //             const page1Ids = page1Response.results.map(job => job.id);
    //             const page2Ids = page2Response.results.map(job => job.id);
    //             expect(page1Ids).not.toEqual(page2Ids);
    //         }
    //     });
    //
    //     test('should maintain consistency across multiple pages with same count', async () => {
    //         const jobType = 'software developer';
    //         const count = 5;
    //         const options = { results_per_page: count };
    //
    //         const responses = [];
    //         for (let page = 1; page <= 3; page++) {
    //             const response = await requestSender.sendRequest(jobType, page, options);
    //             responses.push(response);
    //
    //             // Add delay to avoid rate limiting
    //             await new Promise(resolve => setTimeout(resolve, 100));
    //         }
    //
    //         // All responses should have the same structure and total count
    //         responses.forEach((response, index) => {
    //             expect(response).toHaveProperty('results');
    //             expect(response).toHaveProperty('count');
    //             expect(response.results.length).toBeLessThanOrEqual(count);
    //             expect(response.data_provider).toBe('Adzuna');
    //
    //             if (index > 0) {
    //                 expect(response.count).toBe(responses[0].count);
    //             }
    //         });
    //     });
    // });
    //
    // describe('Response Structure Validation', () => {
    //     test('should return properly formatted response with all required fields', async () => {
    //         const jobType = 'software developer';
    //         const options = { results_per_page: 5 };
    //
    //         const response = await requestSender.sendRequest(jobType, 1, options);
    //
    //         // Check main response structure
    //         expect(response).toHaveProperty('results');
    //         expect(response).toHaveProperty('count');
    //         expect(response).toHaveProperty('data_provider');
    //         expect(response).toHaveProperty('location');
    //         expect(response).toHaveProperty('language');
    //         expect(response).toHaveProperty('job_type');
    //
    //         // Check response values
    //         expect(response.data_provider).toBe('Adzuna');
    //         expect(response.job_type).toBe(jobType);
    //         expect(typeof response.count).toBe('number');
    //         expect(Array.isArray(response.results)).toBe(true);
    //
    //         // Check individual job structure if results exist
    //         if (response.results.length > 0) {
    //             const job = response.results[0];
    //             expect(job).toHaveProperty('id');
    //             expect(job).toHaveProperty('title');
    //             expect(job).toHaveProperty('company');
    //             expect(job).toHaveProperty('location');
    //         }
    //     });
    // });
}, 30000); // 30 second timeout for E2E tests