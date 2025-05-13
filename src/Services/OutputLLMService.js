const OutputLLM = require("../Models/OutputLLM");

const getAll = async () => {
    return OutputLLM.find();
};

module.exports = {getAll};
