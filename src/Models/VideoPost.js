const Text = require("./Text");
const VideoPostSchema = require("../Schemas/VideoPost");

const VideoPost = Text.Text.discriminator("VideoPost", VideoPostSchema);

module.exports.VideoPost = VideoPost;
