const express = require("express");
const {
    searchBackground,
    getBackground,
    createBackground,
    updateBackground,
    deleteBackground,
} = require("../Controllers/BackgroundController");
const router = express.Router();

router.get("/search", searchBackground);
router.get("/get", getBackground);
router.post("/", createBackground);
router.put("/", updateBackground);
router.delete("/", deleteBackground);

module.exports = router;
