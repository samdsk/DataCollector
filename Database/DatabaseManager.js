import {db_close, db_connect} from "./db_handler";

const Logger = require("../Library/Loggers/DatabaseLogger");

class DatabaseManager {
    async connect() {
        Logger.info("Starting...");
        await db_connect(process.env.DB_PROD_URL);
    }

    async disconnect() {
        await db_close();
    }
}

module.exports = DatabaseManager;