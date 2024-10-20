const express = require("express");
const {
    searchLabel,
    getLabel,
    createLabel,
    updateLabel,
    deleteLabel,
} = require("../Controllers/LabelController");
const router = express.Router();

router.get("/search", searchLabel);
router.get("/get", getLabel);
router.post("/", createLabel);
router.put("/", updateLabel);
router.delete("/", deleteLabel);

module.exports = router;
