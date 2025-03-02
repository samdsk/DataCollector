const {fork} = require('child_process')

const Logger = require("./Library/Loggers/MasterProcessLogger")
const SERVER_PROCESS = require("./Library/Constants").SERVER;
const COLLECTOR_PROCESS = require("./Library/Constants").COLLECTOR;


const SERVER = {
    name: SERVER_PROCESS,
    path: './server'
}
const COLLECTOR = {
    name: COLLECTOR_PROCESS,
    path: './collector'
}

const PROCESS_MAP = {}

const start = async () => {
    Logger.info(`Started MasterProcess with pid ${process.ppid}`);

    startChildProcess(COLLECTOR.name, COLLECTOR.path)
    startChildProcess(SERVER.name, SERVER.path)
};

function startChildProcess(pName, pPath) {
    const child = fork(pPath);

    PROCESS_MAP[pName] = child;

    Logger.info(`Process ${pName} started with PID : ${child.pid}`);

    child.on("exit", (code, signal) => {
        if (code !== 0) {
            Logger.info(`Process ${pName} crashed with code ${code}. Restarting...`)
            startChildProcess(pName, pPath);

        } else {
            Logger.info(`Process ${pName} exited with code ${code}.`)
        }
    })

    child.on("error", (error) => {
        Logger.info(`ERROR: Failed to start process ${pName} : ${child.pid}`);
        Logger.error(error)
    })

    Logger.info(`setting up message relaying for ${pName}`)
    child.on("message", (msg) => {
        if (msg.to) {
            Logger.info(`Relaying message from ${msg.from} to ${msg.to} : ${msg.code}`)
            if (pName !== msg.to)
                PROCESS_MAP[msg.to].send(msg);
        }
    })
}

(() => {
    try {
        start();
    } catch (e) {
        Logger.error(e)
    }
})()
