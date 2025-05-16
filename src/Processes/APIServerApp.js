require("dotenv").config();

const Logger = require("../DataCollector/Loggers/ServerLogger")
const morgan = require("morgan");
const {db_connect, db_close} = require("../Database/DatabaseManager");
const net = require('net');

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
const APIServerApp = express();

const api_route = require("../Routes/ApiRouter");
const login_route = require("../Routes/LoginRouter");
const user_route = require("../Routes/UserRouter");
const ErrorHandler = require("../Middlewares/ErrorHandler");
const {authentication} = require("../Middlewares/Authentication");
const PORT = process.env.PORT || 3000;

APIServerApp.use(morganMiddleware);
APIServerApp.use(express.json());

APIServerApp.use("/api", authentication, api_route);
APIServerApp.use("/login", login_route);
APIServerApp.use("/user", user_route);

APIServerApp.use(ErrorHandler);


const isPortAvailable = (port) => {
    return new Promise((resolve) => {
        const server = net.createServer();

        server.once('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                resolve(false); // Port is in use
            } else {
                resolve(false); // Other error
            }
        });

        server.once('listening', () => {
            // Close the server that we opened
            server.close(() => {
                resolve(true); // Port is available
            });
        });

        server.listen(port);
    });
};


const start = async () => {
    try {

        const portAvailable = await isPortAvailable(PORT);
        if (!portAvailable) {
            Logger.error(`Port ${PORT} is already in use. Please use a different port.`);
            process.exit(1);
        }


        await db_connect(process.env.DB_PROD_URL);
        APIServerApp.listen(PORT, () =>
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