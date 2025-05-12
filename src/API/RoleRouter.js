const express = require("express");
const {
    searchRole,
    getRole,
    createRole,
    updateRole,
    deleteRole,
} = require("../Controllers/RoleController");
const router = express.Router();

router.get("/search", searchRole);
router.get("/get", getRole);
router.post("/", createRole);
router.put("/", updateRole);
router.delete("/", deleteRole);

module.exports = router;
