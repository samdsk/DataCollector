const schedule = require("node-schedule");


class MonthlyRunStrategy {
    static getScheduleRule() {
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
}

module.exports = MonthlyRunStrategy;