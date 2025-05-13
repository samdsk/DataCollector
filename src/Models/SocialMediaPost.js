const Text = require("./Text");
const SocialMediaPostSchema = require("../Schemas/SocialMediaPost");

const SocialMediaPost = Text.Text.discriminator(
    "SocialMediaPost",
    SocialMediaPostSchema
);

module.exports.SocialMediaPost = SocialMediaPost;
