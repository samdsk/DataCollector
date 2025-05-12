const express = require("express");
const {
    searchDomain,
    getDomain,
    createDomain,
    updateDomain,
    deleteDomain,
} = require("../Controllers/DomainController");
const router = express.Router();

router.get("/search", searchDomain);
router.get("/get", getDomain);
router.post("/", createDomain);
router.put("/", updateDomain);
router.delete("/", deleteDomain);

module.exports = router;
