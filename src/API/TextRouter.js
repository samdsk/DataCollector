const express = require("express");
const {searchText, getText} = require("../Controllers/TextController");
const router = express.Router();

router.get("/search", searchText);
router.get("/get", getText);

module.exports = router;
