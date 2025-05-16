const schedule = require("node-schedule");
const Logger = require("../Loggers/CollectorLogger");
const EVENT = "collect";
const API_TRIGGER = "api_trigger";

class Scheduler {
    /**
     *
     * @param {CollectorEventEmitter} emitter
     */
    constructor(emitter) {
        this.eventEmitter = emitter;
        this.task = null;
    }

    start(scheduleExp) {
        if (!this.task) {
            this.task = schedule.scheduleJob(scheduleExp, () => {
                this.emit()
            });
            Logger.info("Scheduler started.");
        } else {
            Logger.info("Scheduler is already running!");
        }
    }

    emit(scheduleExp) {
        Logger.info(`Scheduler: emit: ${EVENT}`);
        this.eventEmitter.emit(EVENT);
        if (scheduleExp) {
            Logger.info("Rescheduling started")
            this.stop();
            this.start(scheduleExp)
            Logger.info(`Rescheduled for ${this.task.nextInvocation()}`)
        }
    }

    stop() {
        if (this.task) {
            this.task.cancel();
            this.task = null;
            Logger.info("Scheduler stopped!");
        }
    }

    /**
     * Returns the next scheduled execution date/time
     * @returns {Date|null} The next execution date or null if no task is scheduled
     */
    getNextExecutionTime() {
        if (!this.task) {
            return null;
        }
        return this.task.nextInvocation();
    }

}

module.exports = {Scheduler, EVENT, API_TRIGGER};
