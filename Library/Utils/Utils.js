require("dotenv").config();
const fs = require("fs").promises;
const JobPostHandler = require("../Handlers/JobPostHandler");
const JobPostService = require("../../Services/JobPostService");
const mongoose = require("mongoose");
const JobPostConverter = require("../Converters/JobPostConverter");

const getJobTypesFromFile = async (filename) => {
    const res = await getJSONFromFile(filename);
    return res.map((job) => job.toLowerCase().trim());
};

const getJSONFromFile = async (filename) => {
    const jobListString = await fs.readFile(filename, {
        flag: "r",
    });

    return JSON.parse(jobListString);
};

const saveToJSON = async (filename, data) => {
    await fs.writeFile(filename + ".json", JSON.stringify(data), {
        encoding: "utf8",
    });
};

const getResultFiles = async () => {
    const files = await fs.readdir("results/");

    return files.filter((file) => file.startsWith("results"));
};

const addJobDescriptionsFromFiles = async () => {
    const files = await getResultFiles();
    const summary = [];

    for (const file of files) {
        const res = await addJobDescriptionsFromFile("results/" + file);
        summary.push(res);
    }

    console.log(summary);
};

const addJobDescriptionsFromFile = async (filename) => {
    const jobs = await getJSONFromFile(filename);

    const controller = new JobPostHandler(RapidApiJobPost, JobPostService);

    const additionalDetails = {
        searchJobType: jobs.jobType,
        searchLocation: jobs.location,
        searchLanguage: jobs.language,
        searchDate: jobs.searchDate
            ? new Date(jobs.searchDate)
            : new Date(Date.now()),
    };

    let count = 0;
    for (const job of jobs.jobs) {
        const added = await controller.insertJob(job, additionalDetails);
        if (added) count++;
    }

    return {
        collected: jobs.jobs.length,
        inserted: count,
        jobType: jobs.jobType,
        location: jobs.location || process.env.API_LOCATION,
        language: jobs.language || process.env.API_LANGUAGE,
        searchDate: jobs.searchDate,
    };
};

module.exports = {
    saveToJSON,
    getJobTypesFromFile,
    getJSONFromFile,
    getResultFiles,
    addJobDescriptionsFromFiles,
    addJobDescriptionsFromFile,
};
