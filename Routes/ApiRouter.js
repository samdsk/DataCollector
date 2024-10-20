const express = require("express");
const router = express.Router();

const gateway = require("../API/ApiGateway");

router.use("/", gateway);

module.exports = router;