require("dotenv").config();

const {db_connect, db_close} = require("./Database/db_handler");
const RapidAPIAutomator = require("./Library/Automators/RapidAPIAutomator");
const {logResultsToJSONFile} = require("./Library/Loggers/ResultsLogger");
const Logger = require("./Library/Loggers/CollectorLogger")

const SEND_TO = require("./Library/Constants").SERVER;
const CURRENT_PROCESS = require("./Library/Constants").COLLECTOR;

const CollectorEventEmitter = require("./Library/Schedular/CollectorEventEmitter");
const {Scheduler, EVENT, API_TRIGGER, getNextSchedule} = require("./Library/Schedular/Scheduler");
const {getJSONFromFile, getJobTypesFromFile} = require("./Library/Utils/Utils");
const RapidAPIRequestSender_v02 = require("./Library/RequestSenders/RapidAPIRequestSender_v02");
const JobPostHandler = require("./Library/Handlers/JobPostHandler");
const RapidAPIConverter = require("./Library/Converters/RapidAPIConverter");
const JobPostService = require("./Services/JobPostService");
const RapidAPICollector = require("./Library/Collectors/RapidAPICollector");
const {ProcessTypes} = require("./Library/Processes/ProcessConstants");

async function rapiAPIJobPostStarter() {
    try {
        const jobList = await getJobTypesFromFile(process.env.JOBTYPES_FILENAME) || [];
        Logger.info(`Loaded ${jobList.length} job types.`);
        const keys = await getJSONFromFile(process.env.KEYS_FILENAME) || [];
        Logger.info(`Loaded ${keys.length} keys.`);

        if (jobList.length === 0 || keys.length === 0) {
            Logger.info("No job types or keys found. Exiting.");
            return;
        }

        const keySet = new Set(keys);
        const sender = new RapidAPIRequestSender_v02();
        const collector = new RapidAPICollector(sender, new JobPostHandler(RapidAPIConverter, JobPostService));
        const automator = new RapidAPIAutomator(keySet, sender, collector);

        const response = await automator.collect(jobList);

        Logger.info("Logging results summary");
        await logResultsToJSONFile("summary", new Date(Date.now()), response);
        Logger.info(JSON.stringify(response));

    } catch (error) {
        Logger.info("Something went wrong in collector wrapper")
        Logger.error(error)
    }
};

const app = async () => {
    const schedulerExpression = getNextSchedule()
    const Emitter = new CollectorEventEmitter();

    Emitter.on(EVENT, () => rapiAPIJobPostStarter());

    const scheduler = new Scheduler(Emitter);
    scheduler.start(schedulerExpression);

    // handle_api_trigger(scheduler);
    Logger.info("started successfully")
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

process.on('message', (message) => {
    Logger.debug(`[COLLECTOR] Received message: ${JSON.stringify(message)}`);

    // Log receipt of test routing message
    if (message.code === 'TEST_ROUTING' && message.from === ProcessTypes.SERVER.name) {
        Logger.debug('[COLLECTOR] Received test routing message from SERVER');

        // Send confirmation back to the server
        process.send({
            from: ProcessTypes.COLLECTOR.name,
            to: ProcessTypes.SERVER.name, code: 'TEST_ROUTING_RECEIVED',
            data: {
                originalTimestamp: message.data?.timestamp, responseTimestamp: Date.now()
            }
        });
    }

});


// const handle_api_trigger = (scheduler) => {
//     process.on("message", (msg) => {
//         if (msg.to === "COLLECTOR" && msg.code === API_TRIGGER) {
//             Logger.info("API trigger received.")
//             scheduler.emit(getNextSchedule())
//             return process.send({to: SEND_TO, from: CURRENT_PROCESS, code: 200})
//         }
//     })
// }

start();