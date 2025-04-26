require("dotenv").config();

const {db_connect, db_close} = require("./Database/db_handler");
const RapidAPIAutomator = require("./Library/Automators/RapidAPIAutomator");
const {logResultsToJSONFile} = require("./Library/resultsLogger");
const Logger = require("./Library/Loggers/CollectorLogger")

const SEND_TO = require("./Library/Constants").SERVER;
const CURRENT_PROCESS = require("./Library/Constants").COLLECTOR;

const CollectorEventEmitter = require("./Library/CollectorEventEmitter");
const {Scheduler, EVENT, API_TRIGGER, getNextSchedule} = require("./Library/Scheduler");
const {getJSONFromFile, getJobTypesFromFile} = require("./Library/utils");

const app = async () => {
    const schedulerExpression = getNextSchedule()

    const keys = await getJSONFromFile(process.env.KEYS_FILENAME);
    const keySet = new Set(keys);

    const jobList = await getJobTypesFromFile(process.env.JOBTYPES_FILENAME);

    const Emitter = new CollectorEventEmitter();

    Emitter.on(EVENT, wrapper.bind(null, jobList));

    const scheduler = new Scheduler(Emitter);
    scheduler.start(schedulerExpression);

    handle_api_trigger(scheduler);
    Logger.info("started successfully")
};

const wrapper = async (jobList) => {
    try {
        const keys = await getJSONFromFile(process.env.KEYS_FILENAME);
        const keySet = new Set(keys);

        const automator = new RapidAPIAutomator(keySet);
        automator.init();
        const response = await automator.collect(jobList);

        Logger.info("Logging results summary");
        await logResultsToJSONFile("summary", new Date(Date.now()), response);
        Logger.info(JSON.stringify(response));

    } catch (error) {
        Logger.info("Something went wrong in collector wrapper")
        Logger.error(error)
    }
};

async function start() {
    try {
        Logger.info("Starting...");
        await db_connect(process.env.DB_PROD_URL);
        await app();
    } catch (error) {
        Logger.info("Something went wrong in collector start")
        Logger.error(error)
        await db_close();
        process.exit(1);
    }
}

const handle_api_trigger = (scheduler) => {
    process.on("message", (msg) => {
        if (msg.to === "COLLECTOR" && msg.code === API_TRIGGER) {
            Logger.info("API trigger received.")
            scheduler.emit(getNextSchedule())
            return process.send({to: SEND_TO, from: CURRENT_PROCESS, code: 200})
        }
    })
}

start();