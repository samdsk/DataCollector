require("dotenv").config();

const {db_connect, db_close} = require("../Database/DatabaseManager");
const Logger = require("../DataCollector/Loggers/CollectorLogger")

const ProcessRegistry = require("../DataCollector/CollectorProcessRegistry");
const SchedulerManager = require("../DataCollector/Schedulers/SchedulerManager");
const RapidAPIAutomatorFactory = require("../DataCollector/Factories/RapidAPIAutomatorFactory");
const RapidAPICollectionProcess = require("../DataCollector/CollectorProcesses/RapidAPICollectorProcess");
const RapidAPIConfigLoader = require("../DataCollector/ConfigLoaders/RapidAPIConfigLoader");
const RapidAPIResultsProcessor = require("../DataCollector/ResultProcessors/RapidAPIResultProcessor");
const {Scheduler} = require("../DataCollector/Schedulers/Scheduler");
const CollectorEventEmitter = require("../DataCollector/Schedulers/CollectorEventEmitter");
const DailyRunStrategy = require("../DataCollector/Schedulers/RunStrategy/DailyRunStrategy");

class CollectorApp {
    constructor() {
        this.processRegistry = new ProcessRegistry();
        this.eventEmitter = new CollectorEventEmitter();
        this.schedulerManager = new SchedulerManager(new Scheduler(this.eventEmitter), this.eventEmitter, this.processRegistry, DailyRunStrategy);
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
            RapidAPIAutomatorFactory,
            RapidAPIResultsProcessor,
            RapidAPIConfigLoader,
            this.schedulerManager
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
