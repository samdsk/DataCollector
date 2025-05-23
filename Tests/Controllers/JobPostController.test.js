const JobPostHandler = require("../../src/DataCollector/Handlers/JobPostHandler");
const JobPostService = require("../../src/Services/JobPostService");
const RapidAPIConverter = require("../../src/DataCollector/Converters/RapidAPIConverter");

describe("JobPostHandler: ", () => {
    beforeEach(() => jest.restoreAllMocks());

    it("insert single job post", async () => {
        const jobPostHandler = new JobPostHandler(
            RapidAPIConverter,
            JobPostService
        );

        const spyJobPostService = jest
            .spyOn(JobPostService, "create")
            .mockImplementation(() => Promise.resolve());

        const spyConverter = jest
            .spyOn(RapidAPIConverter, "convert")
            .mockImplementation(() => Promise.resolve());

        const job = {};
        const job_type = "job_type";
        await jobPostHandler.insert(job, job_type);

        expect(spyConverter).toHaveBeenCalled();
        expect(spyJobPostService).toHaveBeenCalled();
    });

    it("insert a list of job posts", async () => {
        const jobPostHandler = new JobPostHandler(
            RapidAPIConverter,
            JobPostService
        );

        const spyJobPostService = jest
            .spyOn(JobPostService, "create")
            .mockImplementation(() => Promise.resolve());

        const spyConverter = jest
            .spyOn(RapidAPIConverter, "convert")
            .mockImplementation(() => Promise.resolve());

        const jobs = ["1", "2"];
        const job_type = "job_type";
        await jobPostHandler.insertList(jobs, job_type);

        expect(spyConverter).toHaveBeenCalledTimes(2);
        expect(spyJobPostService).toHaveBeenCalledTimes(2);
    });
});
