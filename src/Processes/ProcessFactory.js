const {ProcessTypes} = require("./ProcessConstants");
const ChildProcess = require("./ChildProcess");

class ProcessFactory {
    static createProcess(type) {
        const config = ProcessTypes[type];
        return new ChildProcess(config);
    }
}

module.exports = ProcessFactory;