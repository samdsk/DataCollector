const express = require("express");
const router = express.Router();
const {authentication, roleAuthentication, ROLES} = require("../Middlewares/Authentication");
const {changePassword, changeUserType, createUser, deleteUser} = require("../Controllers/UserController");

router.put("/changePassword", changePassword);
router.put("/changeUserType", authentication, roleAuthentication(...ROLES.Admin), changeUserType);
router.post("/", createUser);
router.delete("/", deleteUser);


module.exports = router;