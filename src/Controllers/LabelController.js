const Label = require("../Models/Label");
const LabelService = require("../Services/LabelService");
const {
    searchMultiple,
    searchSingle,
    createSimpleDocument,
} = require("./CommonControllerMethods");
const RequestError = require("../Errors/RequestError");

const searchLabel = async (req, res, next) => {
    try {
        const result = await searchMultiple(req, Label.Label);
        return res.json(result);
    } catch (error) {
        next(error);
    }
};

const getLabel = async (req, res, next) => {
    try {
        const result = await searchSingle(req, Label.Label);
        return res.json(result);
    } catch (error) {
        next(error);
    }
};

const createLabel = async (req, res, next) => {
    const label = req.body.label || "";

    try {
        if (!label) return next(new RequestError("label is required"));
        const result = await createSimpleDocument(label, LabelService.create);
        return res.json(result);
    } catch (error) {
        next(error);
    }
};

const updateLabel = async (req, res, next) => {
    const label = req.body.label || "";
    const id = req.body.id || "";

    try {
        if (!label || !id) return next(new RequestError("id and label are required"));

        const result = await LabelService.updateLabel(id, label);

        if (result === null) return next(new RequestError(`Update operation failed`));

        return res.json({success: true});
    } catch (error) {
        next(error);
    }
};

const deleteLabel = async (req, res, next) => {
    const id = req.body.id || "";
    try {
        if (!id) return next(new RequestError("id is required"));

        const result = await LabelService.deleteLabel(id);

        if (result === null) return next(new RequestError(`Delete operation failed`));

        return res.json({success: true, result: result});
    } catch (error) {
        next(error);
    }
};

module.exports = {
    searchLabel,
    getLabel,
    createLabel,
    updateLabel,
    deleteLabel,
};
