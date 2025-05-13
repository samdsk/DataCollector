const express = require("express");
const {
    searchOutputLLM,
    getOutputLLM,
} = require("../Controllers/OutputLLMController");
const router = express.Router();

router.get("/search", searchOutputLLM);
router.get("/get", getOutputLLM);

module.exports = router;
