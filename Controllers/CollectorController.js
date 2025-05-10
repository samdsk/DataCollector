const {API_TRIGGER} = require('../Library/Schedulers/Scheduler')
const RequestError = require("../Errors/RequestError");
const Logger = require("../Library/Loggers/ServerLogger");

const {ProcessType} = require("../Processes/ProcessConstants");
const CURRENT_PROCESS = ProcessType.SERVER.name;
const SEND_TO = ProcessType.COLLECTOR.name;

const triggerCollector = async (req, res, next) => {
    const collect = req.body.collect || false;
    let status = 400;
    if (collect === true) {
        Logger.info("Triggering collector.")
        try {
            status = await sendTrigger({to: SEND_TO, from: CURRENT_PROCESS, code: API_TRIGGER});
            Logger.info("received collector response.")
            if (status.code === 200)
                return res.json({success: true});
            else
                return next(new Error("Unsuccessful manual collector trigger."))
        } catch (error) {
            return next(new Error("Manual collector trigger failed."))
        }
    }

    return next(new RequestError("Unknown command"));
}

const sendTrigger = async (msg) => {
    return new Promise((resolve, reject) => {
        process.once("message", (response) => {
            resolve(response)
        })

        process.send(msg)
    })
}

module.exports = {
    triggerCollector
}