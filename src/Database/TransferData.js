const mongoose = require("mongoose");
require("dotenv").config();
const Logger = require("../Library/Loggers/CollectorLogger");
const OldJobPost = require("../Models/OldJobPost");

const JobPostSchema = require("../Schemas/JobPost");
const DataProviderService = require("../Services/DataProviderService");
const JobPostService = require("../Services/JobPostService");
const JobPostConverter = require("../Library/Converters/JobPostConverter");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const transferJobPosts = async (local, remote) => {
    const conn_local = mongoose.createConnection(local);
    const conn_remote = mongoose.createConnection(remote);

    const JobPost_local = conn_local.model("JobPost", JobPostSchema);
    const JobPost_remote = conn_remote.model("JobPost", JobPostSchema);

    const total = await JobPost_local.countDocuments();
    let count = 0;

    for await (let job of JobPost_local.find().lean()) {
        console.log(`processing: ${job._id}`);

        try {
            const res = await JobPost_remote.create(job);
            if (res) count++;
        } catch (error) {
            console.error(`error: ${job._id} : ${error.message}`);
        }
    }

    console.log(
        `Total: ${total}, inserted: ${count}, not inserted: ${total - count}`
    );

    await conn_local.close();
    await conn_remote.close();

    return {total, count};
};

async function convertOldJobPostToText(DB_URL, data_provider_name, language) {
    await mongoose.connect(DB_URL);
    await DataProviderService.create(data_provider_name);
    const total = await OldJobPost.countDocuments();
    let count = 0;

    for await (const oldJob of OldJobPost.find()) {
        try {
            const textJob = JobPostConverter.convert(
                oldJob,
                data_provider_name,
                language
            );
            const res = await JobPostService.create(textJob);
            if (res) count++;
            else Logger.debug(`not inserted: ${oldJob._id}`);
        } catch (error) {
            console.error(`error: ${oldJob._id} : ${error.message}`);
        }
        console.log(
            `Processed: ${count} of ${total} - ${(count / total).toFixed(5) * 100}%`
        );
    }

    console.log(
        `Total: ${total}, inserted: ${count}, not inserted: ${total - count}`
    );
    await mongoose.connection.close();
    return {total, count};
}

module.exports = {transferJobPosts, convertOldJobPostToText};
