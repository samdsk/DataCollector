const CollectorEventEmitter = require("./CollectorEventEmitter");
const {API_TRIGGER, EVENT, getNextSchedule, Scheduler} = require("./Scheduler");
const {ProcessTypes} = require("../../Processes/ProcessConstants");

const Logger = require("../Loggers/CollectorLogger");
const CURRENT_PROCESS = ProcessTypes.COLLECTOR.name
const SEND_TO = ProcessTypes.SERVER.name;

class SchedulerManager {
    constructor(processRegistry) {
        this.processRegistry = processRegistry;
        this.emitter = new CollectorEventEmitter();
        this.scheduler = new Scheduler(this.emitter);
    }

    initialize() {
        this.emitter.on(EVENT, async () => {
            const results = await this.processRegistry.executeAll();
            Logger.info(`Executed ${results.length} processes`);
        });

        this.scheduler.start(getNextSchedule());
        this.setupAPITrigger();
        Logger.info(`Scheduler initialized with next execution at ${this.scheduler.getNextExecutionTime()}`);
    }

    setupAPITrigger() {
        process.on("message", (msg) => {
            if (msg.to === "COLLECTOR" && msg.code === API_TRIGGER) {
                Logger.info("API trigger received.");
                this.scheduler.emit(getNextSchedule());
                return process.send({to: SEND_TO, from: CURRENT_PROCESS, code: 200});
            }
        });
    }

}

module.exports = SchedulerManager;