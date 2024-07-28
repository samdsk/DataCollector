const logger = require("../lib/logger");

class JobPostController {
  constructor(Converter, JobPostService) {
    this.Converter = Converter;
    this.JobPostService = JobPostService;
  }

  async insertJob(job, job_type, language) {
    try {
      const jobPost = this.Converter.convert(job, job_type, language);
      return await this.JobPostService.create(jobPost);
    } catch (err) {
      console.error(err);
      logger.debug(JSON.stringify(err.message));
      return null;
    }
  }

  async insertListOfJobs(jobs, job_type, language) {
    let count = 0;

    for (const job of jobs) {
      const res = await this.insertJob(job, job_type, language);
      if (res) count++;
    }

    return count;
  }
}

module.exports = JobPostController;
