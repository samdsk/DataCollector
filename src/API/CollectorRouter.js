const express = require("express");
const {
    triggerCollector,
} = require("../Controllers/CollectorController");
const router = express.Router();

router.post("/", triggerCollector);

module.exports = router;
