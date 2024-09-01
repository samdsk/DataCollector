const CollectorLogger = require("winston").loggers.get("Collector");
const JobPost = require("../Models/JobPost");
const {searchMultiple, searchSingle, createSimpleDocument} = require("./CommonControllerMethods");
const RequestError = require("../Errors/RequestError");
const JobPostService = require("../Services/JobPostService");

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
            CollectorLogger.debug(JSON.stringify(err.message));
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

const searchJobPosts = async (req, res, next) => {
    try {
        const result = await searchMultiple(req, JobPost.JobPost);
        return res.json(result);
    } catch (error) {
        next(error);
    }
};

const getJobPost = async (req, res, next) => {
    try {
        const result = await searchSingle(req, JobPost.JobPost);
        return res.json(result);
    } catch (error) {
        next(error);
    }
};

const createJobPost = async (req, res, next) => {
    const title = req.body.title || "";
    const text = req.body.text || "";
    const data_provider = req.body.data_provider || "";
    const links = req.body.links || [];
    const author = req.body.author || "";
    const icu_locale_language_tag = req.body.icu_locale_language_tag || "";
    const job_type = req.body.job_type || "";
    const company = req.body.company || "";
    const location = req.body.location || "";
    const employment_type = req.body.employment_type || "";

    if (!title ||
        !text ||
        !data_provider ||
        links.length === 0 ||
        !icu_locale_language_tag ||
        !job_type || !location ||
        !company) {
        return next(new RequestError(
            "title, job_type, company, location, text, data_provider, links, icu_locale_language_tag are required",
            400));
    }

    const job_post = {
        title: title,
        data_provider: data_provider,
        links: links,
        author: author,
        icu_locale_language_tag: icu_locale_language_tag,
        job_type: job_type,
        company: company,
        location: location,
        employment_type: employment_type,
        text: text
    }

    try {
        const result = await createSimpleDocument(
            job_post,
            JobPostService.create
        );

        return res.json(result);
    } catch (error) {
        next(error);
    }
}

const updateJobPost = async (req, res, next) => {
    const title = req.body.title || "";
    const text = req.body.text || "";
    const data_provider = req.body.data_provider || "";
    const links = req.body.links || "";
    const author = req.body.author || "";
    const icu_locale_language_tag = req.body.icu_locale_language_tag || "";
    const job_type = req.body.job_type || "";
    const company = req.body.company || "";
    const location = req.body.location || "";
    const employment_type = req.body.employment_type || "";
    const id = req.body.id || "";

    if (!id) return next(new RequestError("id is required", 400));
    if (!Array.isArray(links)) return next(new RequestError("links field must be an array", 400));

    try {

        const update = {};
        if (text) update.text = text;
        if (title) update.title = title;
        if (data_provider) update.data_provider = data_provider;
        if (author) update.author = author;
        if (icu_locale_language_tag) update.icu_locale_language_tag = icu_locale_language_tag;
        if (job_type) update.job_type = job_type;
        if (company) update.company = company;
        if (location) update.location = location;
        if (employment_type) update.employment_type = employment_type;
        if (Array.isArray(links) && links.length !== 0) update.links = links;

        const result = await JobPostService.updateJobPost(id, update);
        if (result === null) return next(new RequestError(`Update operation failed`, 400));
        return res.json({success: true});
    } catch (error) {
        next(error);
    }
}

const deleteJobPost = async (req, res, next) => {
    const id = req.body.id || "";
    if (!id) return next(new RequestError("id is required", 400));

    try {
        const result = await JobPostService.deleteOne(id);
        return res.json({success: true, result: result});
    } catch (error) {
        next(error);
    }
}

module.exports = {
    JobPostController,
    searchJobPosts,
    getJobPost,
    createJobPost,
    updateJobPost,
    deleteJobPost

};
