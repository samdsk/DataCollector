const schedule = require("node-schedule");


class DailyRunStrategy {
    static getScheduleRule() {
        const now = new Date();

        const firstRunDate = new Date(now.getTime() + 2 * 60 * 1000);

        const rule = new schedule.RecurrenceRule();
        rule.hour = firstRunDate.getHours();
        rule.minute = firstRunDate.getMinutes();

        return rule;
    }
}

module.exports = DailyRunStrategy;