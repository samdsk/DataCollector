import CollectorEventEmitter from "./CollectorEventEmitter";
import {API_TRIGGER, EVENT, getNextSchedule, Scheduler} from "./Scheduler";
import {ProcessTypes} from "../Processes/ProcessConstants";

const Logger = require("../Loggers/CollectorLogger");
const CURRENT_PROCESS = ProcessTypes.COLLECTOR.name
const SEND_TO = ProcessTypes.SERVER.name;

class SchedulerManager {
    constructor(collectorProcess) {
        this.collectorProcess = collectorProcess;
        this.emitter = new CollectorEventEmitter();
        this.scheduler = new Scheduler(this.emitter);
    }

    initialize() {
        this.emitter.on(EVENT, () => this.collectorProcess.execute());
        this.scheduler.start(getNextSchedule());
        this.setupAPITrigger();
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