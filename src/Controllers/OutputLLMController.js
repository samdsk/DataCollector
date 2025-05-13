const OutputLLM = require("../Models/OutputLLM");
const {searchMultiple, searchSingle} = require("./CommonControllerMethods");

const searchOutputLLM = async (req, res, next) => {
    try {
        const result = await searchMultiple(req, OutputLLM);
        return res.json(result);
    } catch (error) {
        next(error);
    }
};

const getOutputLLM = async (req, res, next) => {
    try {
        const result = await searchSingle(req, OutputLLM);
        return res.json(result);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    searchOutputLLM,
    getOutputLLM,
};
