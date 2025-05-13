require("dotenv").config();
const mongoose = require("mongoose");
const pipeline = require("./finetune_pipeline");

const Logger = require("../DataCollector/Loggers/DatabaseLogger");

const db_connect = async (DB_URL) => {
    const default_url = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_URI}/${process.env.DB_NAME}`
    const url = DB_URL || default_url;
    await mongoose.connect(url);

    await mongoose.connection.db.createCollection("outputllms", {
        viewOn: "annotations",
        pipeline: pipeline,
    });

    Logger.info(`DB connected.`);
};
const db_close = async () => {
    await mongoose.connection.close();
    Logger.info(`DB connection closed.`);
};

module.exports = {db_connect, db_close};
