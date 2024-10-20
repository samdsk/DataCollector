const express = require("express");
const {
    searchAnnotator,
    getAnnotator,
    createAnnotator,
    updateAnnotator,
    deleteAnnotator,
} = require("../Controllers/AnnotatorController");
const router = express.Router();

router.get("/search", searchAnnotator);
router.get("/get", getAnnotator);
router.post("/", createAnnotator);
router.put("/", updateAnnotator);
router.delete("/", deleteAnnotator);

module.exports = router;
