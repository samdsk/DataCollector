const mongoose = require("mongoose");

const VideoPost = new mongoose.Schema(
    {
        video_source: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            collation: {locale: 'en', strength: 2}
        },
    },
    {timestamps: true}
);

module.exports = VideoPost;
