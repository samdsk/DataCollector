const Collection = require("../Models/Collection");
const CollectionService = require("../Services/CollectionService");
const {
    searchMultiple,
    searchSingle,
    createSimpleDocument,
} = require("./CommonControllerMethods");
const RequestError = require("../Errors/RequestError");

const searchCollection = async (req, res, next) => {
    try {
        const result = await searchMultiple(req, Collection.Collection);
        return res.json(result);
    } catch (error) {
        next(error);
    }
};

const getCollection = async (req, res, next) => {
    try {
        const result = await searchSingle(req, Collection.Collection);
        return res.json(result);
    } catch (error) {
        next(error);
    }
};

const createCollection = async (req, res, next) => {
    const collection_name = req.body.collection_name || "";
    const texts = req.body.texts || [];

    if (!collection_name || texts.length === 0) {
        return next(new RequestError("Create operation failed, following fields are required: collection_name, texts"));
    }

    const Collection = {
        collection_name: collection_name,
        texts: texts
    }

    try {
        const result = await createSimpleDocument(
            Collection,
            CollectionService.create
        );

        return res.json(result);
    } catch (error) {
        next(error);
    }
};

const updateCollection = async (req, res, next) => {
    const collection_name = req.body.collection_name || "";
    const texts = req.body.texts || "";
    const id = req.body.id || "";

    if (!id) return next(new RequestError("id is required"));
    if (!Array.isArray(texts)) return next(new RequestError("texts field must be an array"));

    try {
        const update = {};
        if (collection_name) update.collection_name = collection_name;
        if (texts.length !== 0) update.texts = texts;

        const result = await CollectionService.updateCollection(id, update);
        if (result === null) return next(new RequestError(`Update operation failed`));
        return res.json({success: true});
    } catch (error) {
        next(error);
    }
};

const deleteCollection = async (req, res, next) => {
    const id = req.body.id || "";
    if (!id) return next(new RequestError("id is required"));

    try {
        const result = await CollectionService.deleteCollection(id);
        if (result === null) return next(new RequestError(`Delete operation failed`));
        return res.json({success: true, result: result});
    } catch (error) {
        next(error);
    }
};

const addCollectionText = async (req, res, next) => {
    const id = req.body.id || "";
    const text = req.body.text || "";

    if (!id) return next(new RequestError("id is required"));
    if (!text) return next(new RequestError("text is required"));

    try {
        const result = await CollectionService.addText(id, text);

        return res.json({success: true, result: result});
    } catch (error) {
        next(error);
    }
};

const deleteCollectionText = async (req, res, next) => {
    const id = req.body.id || "";
    const text = req.body.text || "";

    if (!id) return next(new RequestError("id is required"));
    if (!text) return next(new RequestError("text is required"));

    try {
        const result = await CollectionService.removeText(id, text);

        return res.json({success: true, result: result});
    } catch (error) {
        next(error);
    }
};
module.exports = {
    searchCollection,
    getCollection,
    createCollection,
    updateCollection,
    deleteCollection,
    addCollectionText,
    deleteCollectionText
};
