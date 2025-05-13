const {Annotation} = require("../Models/Annotation");
const TransactionWrapper = require("../Database/TransactionWrapper");

const opts = {runValidators: true};

const create = async (annotation) => {
    return Annotation.create(annotation);
};

const updateText = async (id, text) => {
    return Annotation.updateOne({_id: id}, {text: text}, opts);
};

const updateAnnotator = async (id, annotator) => {
    return Annotation.updateOne(
        {_id: id},
        {annotator: annotator},
        opts
    );
};

const updateLabel = async (id, label) => {
    return Annotation.updateOne({_id: id}, {label: label}, opts);
};

const updateReason = async (id, reason) => {
    return Annotation.updateOne({_id: id}, {reason: reason}, opts);
};

const updateDomain = async (id, domain) => {
    return Annotation.updateOne({_id: id}, {domain: domain}, opts);
};

const updateTokens = async (id, tokens) => {
    return Annotation.updateOne({_id: id}, {tokens: tokens}, opts);
};

const addToken = async (id, token) => {
    return Annotation.updateOne(
        {_id: id},
        {$push: {tokens: token}},
        opts
    );
};
const deleteToken = async (id, token) => {
    return Annotation.updateOne(
        {_id: id},
        {$pull: {tokens: token}},
        opts
    );
};

const deleteAnnotations = async (filter, session) => {
    if (session) return await deleteAnnotationsWithSession(filter, session);
    else
        return TransactionWrapper.transactionWrapper(
            filter,
            deleteAnnotationsWithSession
        );
};

const deleteAnnotationsWithSession = async (filter, session) => {
    return Annotation.deleteMany(filter, {session});
};

const deleteAnnotation = async (id, session) => {
    if (session) return await deleteAnnotationWithSession(id, session);
    else return await TransactionWrapper.transactionWrapper(id, deleteAnnotationWithSession);
};

const deleteAnnotationWithSession = async (id, session) => {
    return Annotation.deleteOne({_id: id}, {session});
};

const getAll = async () => {
    return Annotation.find();
};

const getAnnotationsByText = async (text) => {
    return Annotation.find({text: text});
};
const getAnnotationsByLabel = async (label) => {
    return Annotation.find({label: label});
};
const getAnnotationsByDomain = async (domain) => {
    return Annotation.find({domain: domain});
};
const getAnnotationsByAnnotator = async (annotator) => {
    return Annotation.find({annotator: annotator});
};

const getText = async (id) => {
    const res = await Annotation.findById(id);
    return res?.text || null;
};
const getAnnotator = async (id) => {
    const res = await Annotation.findById(id);
    return res?.annotator || null;
};
const getLabel = async (id) => {
    const res = await Annotation.findById(id);
    return res?.label || null;
};
const getReason = async (id) => {
    const res = await Annotation.findById(id);
    return res?.reason || null;
};
const getDomain = async (id) => {
    const res = await Annotation.findById(id);
    return res?.domain || null;
};
const getTokens = async (id) => {
    const res = await Annotation.findById(id);
    return res?.tokens || [];
};

const updateAnnotation = async (id, annotation) => {
    const found = await Annotation.exists({_id: id});

    if (!found) return null;

    return Annotation.updateOne(
        {_id: id},
        annotation,
        opts
    );
}

module.exports = {
    create,
    updateText,
    updateAnnotator,
    updateLabel,
    updateReason,
    updateDomain,
    updateTokens,
    addToken,
    deleteToken,
    deleteAnnotations,
    deleteAnnotation,
    getAll,
    getAnnotationsByAnnotator,
    getAnnotationsByDomain,
    getAnnotationsByLabel,
    getAnnotationsByText,
    getText,
    getTokens,
    getDomain,
    getReason,
    getLabel,
    getAnnotator,
    updateAnnotation
};
