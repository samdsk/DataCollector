const express = require("express");
const {
    searchJobPosts,
    getJobPost,
    createJobPost,
    updateJobPost,
    deleteJobPost
} = require("../Controllers/JobPostController");

const {
    addLink,
    removeLinkBySource,
    removeLinkByURL
} = require("../Controllers/TextController");
const {roleAuthentication, ROLES} = require("../Middlewares/Authentication");


const router = express.Router();

router.get("/search", searchJobPosts);
router.get("/get", getJobPost);
router.post("/", createJobPost);
router.put("/", updateJobPost);
router.delete("/", roleAuthentication(...ROLES.Admin), deleteJobPost);

router.put("/link", addLink)
router.delete("/linkBySource", removeLinkBySource)
router.delete("/linkByUrl", removeLinkByURL)

module.exports = router;
