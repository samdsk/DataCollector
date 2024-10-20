const mongoose = require("mongoose");

const SocialMediaPost = new mongoose.Schema(
    {
        social_media_source: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            collation: {locale: 'en', strength: 2}
        },
        hashtags: [String],
    },
    {timestamps: true}
);

module.exports = SocialMediaPost;
