const {JobPostController} = require("../../Controllers/JobPostController");
const JobPostService = require("../../Services/JobPostService");
const RapidAPIConverter = require("../../Library/Converters/RapidAPIConverter");

describe("JobPostController: ", () => {
    beforeEach(() => jest.restoreAllMocks());

    it("insert single job post", async () => {
        const jobPostController = new JobPostController(
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
        await jobPostController.insertJob(job, job_type);

        expect(spyConverter).toHaveBeenCalled();
        expect(spyJobPostService).toHaveBeenCalled();
    });

    it("insert a list of job posts", async () => {
        const jobPostController = new JobPostController(
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
        await jobPostController.insertListOfJobs(jobs, job_type);

        expect(spyConverter).toHaveBeenCalledTimes(2);
        expect(spyJobPostService).toHaveBeenCalledTimes(2);
    });
});
