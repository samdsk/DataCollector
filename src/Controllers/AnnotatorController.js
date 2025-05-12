const Annotator = require("../Models/Annotator");
const AnnotatorService = require("../Services/AnnotatorService");
const {
    searchMultiple,
    searchSingle,
    createSimpleDocument,
} = require("./CommonControllerMethods");
const RequestError = require("../Errors/RequestError");

const searchAnnotator = async (req, res, next) => {
    try {
        const result = await searchMultiple(req, Annotator.Annotator);
        return res.json(result);
    } catch (error) {
        next(error);
    }
};

const getAnnotator = async (req, res, next) => {
    try {
        const result = await searchSingle(req, Annotator.Annotator);
        return res.json(result);
    } catch (error) {
        next(error);
    }
};

const createAnnotator = async (req, res, next) => {
    const role = req.body.role || "";
    const id = req.body.id || "";
    const background = req.body.background || "";
    const isHuman = req.body.isHuman || undefined;

    try {
        if (!id)
            return next(new RequestError("Create operation failed, id is required"));
        const result = await createSimpleDocument(
            {_id: id, role: role, background: background, isHuman: isHuman},
            AnnotatorService.create
        );
        return res.json(result);
    } catch (error) {
        next(error);
    }
};

const updateAnnotator = async (req, res, next) => {
    const role = req.body.role || "";
    const background = req.body.background || "";
    const isHuman = req.body.isHuman || "";
    const id = req.body.id || "";

    try {
        if (!id) return next(new RequestError("id is required"));
        const update = {};
        console.log(role, background, isHuman);

        if (role) update.role = role;
        if (background) update.background = background;
        if (isHuman) update.isHuman = isHuman;

        const result = await AnnotatorService.updateAnnotator(id, update);

        if (result === null) return next(new RequestError(`Update operation failed`));

        return res.json({success: true});
    } catch (error) {
        next(error);
    }
};

const deleteAnnotator = async (req, res, next) => {
    const id = req.body.id || "";
    try {
        if (!id) return next(new RequestError("id is required"));

        const result = await AnnotatorService.deleteAnnotator(id);

        if (result === null) return next(new RequestError(`Delete operation failed`));

        return res.json({success: true, result: result});
    } catch (error) {
        next(error);
    }
};

module.exports = {
    searchAnnotator,
    getAnnotator,
    createAnnotator,
    updateAnnotator,
    deleteAnnotator,
};
