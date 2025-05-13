const mongoose = require("mongoose");

const JobPost = new mongoose.Schema({
    job_type: {
        type: String, required: true, trim: true,
        collation: {locale: 'en', strength: 2}
    },
    title: {
        type: String, required: true, trim: true,
    },
    company: {
        type: String, required: true, trim: true,
    },
    location: {
        type: String, required: true, trim: true,
    },
    employment_type: {
        type: String, default: "", trim: true,
    },
});

module.exports = JobPost;
