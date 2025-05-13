const express = require("express");
const {
    searchDataProvider,
    getDataProvider,
    createDataProvider,
    updateDataProvider,
    deleteDataProvider,
} = require("../Controllers/DataProviderController");
const {roleAuthentication, ROLES} = require("../Middlewares/Authentication");
const router = express.Router();

router.get("/search", searchDataProvider);
router.get("/get", getDataProvider);
router.post("/", createDataProvider);
router.put("/", updateDataProvider);
router.delete("/", roleAuthentication(...ROLES.Admin), deleteDataProvider);

module.exports = router;
