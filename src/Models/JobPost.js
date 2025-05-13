const Text = require("./Text");
const JobPostSchema = require("../Schemas/JobPost");

const JobPost = Text.Text.discriminator("JobPost", JobPostSchema);

module.exports.JobPost = JobPost;
