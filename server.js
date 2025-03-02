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
const server = express();

const api_route = require("./Routes/ApiRouter");
const login_route = require("./Routes/LoginRouter");
const user_route = require("./Routes/UserRouter");
const ErrorHandler = require("./Middlewares/ErrorHandler");
const {authentication} = require("./Middlewares/Authentication");
const PORT = process.env.PORT || 3000;

server.use(morganMiddleware);
server.use(express.json());

server.use("/api", authentication, api_route);
server.use("/login", login_route);
server.use("/user", user_route);

server.use(ErrorHandler);

const start = async () => {
    try {
        await db_connect(process.env.DB_PROD_URL);
        server.listen(PORT, () =>
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