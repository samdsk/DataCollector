require("dotenv").config();
const Logger = require("./Library/Loggers/ServerLogger")
const morgan = require("morgan");
const {db_connect, db_close} = require("./Database/db_handler");

const morganMiddleware = morgan(
    ":method :url :status :res[content-length] - :response-time ms",
    {
        stream: {
            // Configure Morgan to use our custom logger with the http severity
            write: (message) => Logger.info(message.trim()),
        },
    }
);

const express = require("express");
const processAPIServer = express();

const api_route = require("./Routes/ApiRouter");
const login_route = require("./Routes/LoginRouter");
const user_route = require("./Routes/UserRouter");
const ErrorHandler = require("./Middlewares/ErrorHandler");
const {authentication} = require("./Middlewares/Authentication");
const {ProcessTypes} = require("./Library/Processes/ProcessConstants");
const PORT = process.env.PORT || 3000;

processAPIServer.use(morganMiddleware);
processAPIServer.use(express.json());

processAPIServer.use("/api", authentication, api_route);
processAPIServer.use("/login", login_route);
processAPIServer.use("/user", user_route);

processAPIServer.use(ErrorHandler);

process.on('message', (message) => {
    Logger.debug(`[SERVER] Received message: ${JSON.stringify(message)}`);

    // Process the message

    // Always send a response to confirm message was received
    if (message.code === 'SEND_TEST_TO_COLLECTOR') {
        Logger.debug('[SERVER] Sending test message to COLLECTOR');

        // Send message through the master process to collector
        process.send({
            from: ProcessTypes.SERVER.name, // Set correct from field
            to: ProcessTypes.COLLECTOR.name, // Set correct to field
            code: 'TEST_ROUTING',
            data: {
                timestamp: Date.now()
            }
        });
    }

});


const start = async () => {
    try {
        await db_connect(process.env.DB_PROD_URL);
        processAPIServer.listen(PORT, () =>
            Logger.info(`Server is up and running at port: ${PORT}`)
        );
    } catch (error) {
        await db_close();
        Logger.info("Something went wrong in server")
        console.error(error);
        process.exit(1);
    }
};

start();