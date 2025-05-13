const {JobPost} = require("../Models/JobPost");
const TextService = require("./TextService");
const IdGenerator = require("../DataCollector/Utils/IDGenerator");
const DataProviderService = require("./DataProviderService");

const opts = {runValidators: true};

/**
 * Creates a JobPost
 * @param {JobPost} job_post must respect the JobPost schema
 * @returns inserted JobPost and if it already exists returns null
 */
const create = async (job_post) => {
    const id = IdGenerator.generateJobPostID(job_post);

    const found = await JobPost.exists({_id: id});
    if (found) return null;

    job_post._id = id;

    const data_provider_id = await DataProviderService.getIDByName(
        job_post.data_provider
    );

    if (!data_provider_id)
        throw new Error(`Data Provider ${job_post.data_provider} not found!`);

    job_post.data_provider = data_provider_id;

    return await JobPost.create(job_post);
};

const updateJobType = async (id, job_type) => {
    return await JobPost.updateOne({_id: id}, {job_type: job_type}, opts);
};

const updateCompany = async (id, company) => {
    return await JobPost.updateOne({_id: id}, {company: company}, opts);
};

const updateLocation = async (id, location) => {
    return await JobPost.updateOne({_id: id}, {location: location}, opts);
};

const updateEmploymentType = async (id, employment_type) => {
    return await JobPost.updateOne(
        {_id: id},
        {employment_type: employment_type},
        opts
    );
};

const getAll = async () => {
    const res = await JobPost.find({}, "_id");
    return res.map((e) => e._id);
};

const getByJobType = async (job_type) => {
    return await JobPost.find({job_type: job_type});
};

const getByCompany = async (company) => {
    return await JobPost.find({company: company});
};
const getByLocation = async (location) => {
    return await JobPost.find({location: location});
};
const getByEmploymentType = async (employment_type) => {
    return await JobPost.find({employment_type: employment_type});
};

const getJobType = async (id) => {
    const res = await JobPost.findById(id, "job_type");
    return res?.job_type || null;
};

const getCompany = async (id) => {
    const res = await JobPost.findById(id, "company");
    return res?.company || null;
};
const getLocation = async (id) => {
    const res = await JobPost.findById(id, "location");
    return res?.location || null;
};
const getEmploymentType = async (id) => {
    const res = await JobPost.findById(id, "employment_type");
    return res?.employment_type || null;
};

const getAllTexts = async () => {
    const res = await JobPost.find({}, "text");
    return res.map((e) => e.text);
};

const getByDataProvider = async (data_provider) => {
    return await JobPost.find({data_provider: data_provider});
};

const getByLanguageTag = async (icu_locale_language_tag) => {
    return await JobPost.find({
        icu_locale_language_tag: icu_locale_language_tag,
    });
};

const updateJobPost = async (id, job_post) => {
    const found = await JobPost.exists({_id: id});

    if (!found) return null;

    return JobPost.updateOne({_id: id}, job_post, opts);
}


module.exports = Object.assign(TextService, {
    create,
    updateJobType,
    updateCompany,
    updateLocation,
    updateEmploymentType,
    getAll,
    getAllTexts,
    getByJobType,
    getByCompany,
    getByLocation,
    getByEmploymentType,
    getByDataProvider,
    getByLanguageTag,
    getJobType,
    getCompany,
    getLocation,
    getEmploymentType,
    updateJobPost
});
