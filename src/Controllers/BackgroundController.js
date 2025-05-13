const Background = require("../Models/Background");
const BackgroundService = require("../Services/BackgroundService");
const {
    searchMultiple,
    searchSingle,
    createSimpleDocument,
} = require("./CommonControllerMethods");
const RequestError = require("../Errors/RequestError");

const searchBackground = async (req, res, next) => {
    try {
        const result = await searchMultiple(req, Background.Background);
        return res.json(result);
    } catch (error) {
        next(error);
    }
};

const getBackground = async (req, res, next) => {
    try {
        const result = await searchSingle(req, Background.Background);
        return res.json(result);
    } catch (error) {
        next(error);
    }
};

const createBackground = async (req, res, next) => {
    const background = req.body.background || "";

    try {
        if (!background) return next(new RequestError("background is required"));
        const result = await createSimpleDocument(
            background,
            BackgroundService.create
        );
        return res.json(result);
    } catch (error) {
        next(error);
    }
};

const updateBackground = async (req, res, next) => {
    const background = req.body.background || "";
    const id = req.body.id || "";

    try {
        if (!background || !id)
            return next(new RequestError("id and background are required"));

        const result = await BackgroundService.updateBackground(id, background);

        if (result === null) return next(new RequestError(`Update operation failed`));

        return res.json({success: true});
    } catch (error) {
        next(error);
    }
};

const deleteBackground = async (req, res, next) => {
    const id = req.body.id || "";
    try {
        if (!id) return next(new RequestError("id is required"));

        const result = await BackgroundService.deleteBackground(id);

        if (result === null) return next(new RequestError(`Delete operation failed`));

        return res.json({success: true, result: result});
    } catch (error) {
        next(error);
    }
};

module.exports = {
    searchBackground,
    getBackground,
    createBackground,
    updateBackground,
    deleteBackground,
};
