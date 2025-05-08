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
}

const getNextSchedule = () => {
    // setting a day a month from now
    const now = new Date();
    const day = now.getDate();
    const hour = now.getHours();
    const minute = now.getMinutes();

    const rule = new schedule.RecurrenceRule();
    rule.date = day;
    rule.hour = hour;
    rule.minute = minute;
    rule.month = null;

    return rule
}

module.exports = {Scheduler, EVENT, API_TRIGGER, getNextSchedule};
