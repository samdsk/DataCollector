const express = require("express");
const router = express.Router();

const {login: loginRouter} = require('../Controllers/LoginController');

router.post("/", loginRouter);

module.exports = router;