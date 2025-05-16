const CollectorLogger = require("../Loggers/CollectorLogger");

class JobPostHandler {
    constructor(converter, jobPostService) {
        this.converter = converter;
        this.jobPostService = jobPostService;
    }

    async insert(job, job_type, language) {
        try {
            const jobPost = this.converter.convert(job, job_type, language);
            return await this.jobPostService.create(jobPost);
        } catch (err) {
            CollectorLogger.error("JobPostHandler: Something went wrong during insert " + JSON.stringify(err.message));
            return null;
        }
    }

    async insertList(jobs, job_type, language) {
        let count = 0;

        for (const job of jobs) {
            const res = await this.insert(job, job_type, language);
            if (res) count++;
        }

        return count;
    }
}

module.exports = JobPostHandler;