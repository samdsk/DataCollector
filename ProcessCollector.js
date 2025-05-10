require("dotenv").config();

const {db_connect, db_close} = require("./Database/db_handler");
const Logger = require("./Library/Loggers/CollectorLogger")

const ProcessRegistry = require("./Library/CollectorProcessRegistry");
const SchedulerManager = require("./Library/Schedulers/SchedulerManager");
const RapidAPIAutomatorFactory = require("./Library/Factories/RapidAPIAutomatorFactory");
const RapidAPICollectionProcess = require("./Library/CollectionProcesses/RapidAPICollectionProcess");
const RapidAPIConfigLoader = require("./Library/ConfigLoaders/RapidAPIConfigLoader");
const RapidAPIResultsProcessor = require("./Library/ResultProcessors/RapidAPIResultProcessor");

class CollectorApp {
    constructor() {
        this.processRegistry = new ProcessRegistry();
        this.schedulerManager = new SchedulerManager(this.processRegistry);
    }

    async start() {
        try {
            Logger.info("Starting collector application...");
            await db_connect(process.env.DB_PROD_URL);

            // Register all processes
            this.registerProcesses();

            // Initialize scheduler manager
            this.schedulerManager.initialize();

            Logger.info(`Collector started successfully with ${this.processRegistry.processes.length} registered processes`);
        } catch (error) {
            Logger.info("Something went wrong while starting the collector");
            Logger.error(error);
            await this.shutdown();
            process.exit(1);
        }
    }

    registerProcesses() {
        // Register RapidAPI collection process
        const rapidAPIProcess = new RapidAPICollectionProcess(
            new RapidAPIAutomatorFactory(),
            new RapidAPIResultsProcessor(),
            new RapidAPIConfigLoader()
        );
        this.processRegistry.register(rapidAPIProcess);
    }

    async shutdown() {
        try {
            Logger.info("Shutting down collector application...");

            // Stop the scheduler
            this.schedulerManager.scheduler.stop();

            // Close database connection
            await db_close();

            Logger.info("Collector application shutdown complete");
        } catch (error) {
            Logger.error("Error during shutdown:", error);
        }
    }
}

async function start() {
    Logger.info("Starting collector application...");
    try {
        const app = new CollectorApp();
        await app.start();

    } catch (e) {
        Logger.error(e);
        await app.shutdown();
        process.exit(1);
    }
}

start();
