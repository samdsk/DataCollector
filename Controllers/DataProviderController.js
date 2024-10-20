const DataProvider = require("../Models/DataProvider");
const DataProviderService = require("../Services/DataProviderService");
const {
    searchMultiple,
    searchSingle,
    createSimpleDocument,
} = require("./CommonControllerMethods");
const RequestError = require("../Errors/RequestError");

const searchDataProvider = async (req, res, next) => {
    try {
        const result = await searchMultiple(req, DataProvider.DataProvider);
        return res.json(result);
    } catch (error) {
        next(error);
    }
};

const getDataProvider = async (req, res, next) => {
    try {
        const result = await searchSingle(req, DataProvider.DataProvider);
        return res.json(result);
    } catch (error) {
        next(error);
    }
};

const createDataProvider = async (req, res, next) => {
    const data_provider = req.body.data_provider || "";

    try {
        if (!data_provider)
            return next(new RequestError("data_provider is required"));
        const result = await createSimpleDocument(
            data_provider,
            DataProviderService.create
        );
        return res.json(result);
    } catch (error) {
        next(error);
    }
};

const updateDataProvider = async (req, res, next) => {
    const data_provider = req.body.data_provider || "";
    const id = req.body.id || "";

    try {
        if (!data_provider || !id)
            return next(new RequestError("id and data_provider are required"));

        const result = await DataProviderService.updateDataProvider(
            id,
            data_provider
        );

        if (result === null) return next(new RequestError(`Update operation failed`));

        return res.json({success: true});
    } catch (error) {
        next(error);
    }
};

const deleteDataProvider = async (req, res, next) => {
    const id = req.body.id || "";
    try {
        if (!id) return next(new RequestError("id is required"));

        const result = await DataProviderService.deleteDataProvider(id);

        if (result === null) return next(new RequestError(`Delete operation failed`));

        return res.json({success: true, result: result});
    } catch (error) {
        next(error);
    }
};

module.exports = {
    searchDataProvider,
    getDataProvider,
    createDataProvider,
    updateDataProvider,
    deleteDataProvider,
};
