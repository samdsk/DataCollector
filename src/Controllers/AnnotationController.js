const Annotation = require("../Models/Annotation");
const AnnotationService = require("../Services/AnnotationService");
const {
    searchMultiple,
    searchSingle,
    createSimpleDocument,
} = require("./CommonControllerMethods");
const RequestError = require("../Errors/RequestError");

const searchAnnotation = async (req, res, next) => {
    try {
        const result = await searchMultiple(req, Annotation.Annotation);
        return res.json(result);
    } catch (error) {
        next(error);
    }
};

const getAnnotation = async (req, res, next) => {
    try {
        const result = await searchSingle(req, Annotation.Annotation);
        return res.json(result);
    } catch (error) {
        next(error);
    }
};

const createAnnotation = async (req, res, next) => {
    const text = req.body.text || "";
    const label = req.body.label || "";
    const domain = req.body.domain || "";
    const annotator = req.body.annotator || "";
    const reason = req.body.reason || "";
    const tokens = req.body.tokens || [];

    if (!text || !label || !domain || !annotator || !reason || tokens.length === 0) {
        return next(new RequestError("Create operation failed, following fields are required: text, label, domain, annotator, reason, tokens"));
    }

    const annotation = {
        text: text,
        annotator: annotator,
        label: label,
        domain: domain,
        reason: reason,
        tokens: tokens
    }

    try {
        const result = await createSimpleDocument(
            annotation,
            AnnotationService.create
        );

        return res.json(result);
    } catch (error) {
        next(error);
    }
};

const updateAnnotation = async (req, res, next) => {
    const text = req.body.text || "";
    const label = req.body.label || "";
    const domain = req.body.domain || "";
    const annotator = req.body.annotator || "";
    const reason = req.body.reason || "";
    const tokens = req.body.tokens || "";
    const id = req.body.id || "";

    if (!id) return next(new RequestError("id is required"));
    if (!Array.isArray(tokens)) return next(new RequestError("tokens field must be an array"));
    try {

        const update = {};
        if (text) update.text = text;
        if (label) update.label = label;
        if (domain) update.domain = domain;
        if (annotator) update.annotator = annotator;
        if (reason) update.reason = reason;
        if (Array.isArray(tokens) && tokens.length !== 0) update.tokens = tokens;

        const result = await AnnotationService.updateAnnotation(id, update);
        if (result === null) return next(new RequestError(`Update operation failed`));
        return res.json({success: true});
    } catch (error) {
        next(error);
    }
};

const deleteAnnotation = async (req, res, next) => {
    const id = req.body.id || "";
    if (!id) return next(new RequestError("id is required"));

    try {
        const result = await AnnotationService.deleteAnnotation(id);
        if (result === null) return next(new RequestError(`Delete operation failed`));
        return res.json({success: true, result: result});
    } catch (error) {
        next(error);
    }
};

const addAnnotationToken = async (req, res, next) => {
    const id = req.body.id || "";
    const token = req.body.token || "";

    if (!id) return next(new RequestError("id is required"));
    if (!token) return next(new RequestError("token is required"));

    try {
        const result = await AnnotationService.addToken(id, token);

        return res.json({success: true, result: result});
    } catch (error) {
        next(error);
    }
};

const deleteAnnotationToken = async (req, res, next) => {
    const id = req.body.id || "";
    const token = req.body.token || "";

    if (!id) return next(new RequestError("id is required"));
    if (!token) return next(new RequestError("token is required"));

    try {
        const result = await AnnotationService.deleteToken(id, token);

        return res.json({success: true, result: result});
    } catch (error) {
        next(error);
    }
};
module.exports = {
    searchAnnotation,
    getAnnotation,
    createAnnotation,
    updateAnnotation,
    deleteAnnotation,
    addAnnotationToken,
    deleteAnnotationToken
};
