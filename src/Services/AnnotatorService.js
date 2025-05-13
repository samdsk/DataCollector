const {Annotator} = require("../Models/Annotator");
const AnnotationService = require("./AnnotationService");
const TransactionWrapper = require("../Database/TransactionWrapper");

const opts = {runValidators: true};

const create = async (annotator) => {
    const found = await Annotator.exists({
        role: annotator.role,
        background: annotator.background,
    });

    if (found) return null;
    return Annotator.create(annotator);
};

const updateRole = async (id, role) => {
    return Annotator.updateOne({_id: id}, {role: role}, opts);
};

const updateBackground = async (id, background) => {
    return Annotator.updateOne(
        {_id: id},
        {background: background},
        opts
    );
};

const deleteAnnotator = async (id, session) => {
    if (session) {
        return await deleteAnnotatorWithSession(id, session);
    } else {
        return await TransactionWrapper.transactionWrapper(
            id,
            deleteAnnotatorWithSession
        );
    }
};

const deleteAnnotators = async (filter, session) => {
    if (session) {
        return await deleteAnnotatorsWithSession(filter, session);
    } else {
        return await TransactionWrapper.transactionWrapper(
            filter,
            deleteAnnotatorsWithSession
        );
    }
};

const deleteAnnotatorsWithSession = async (filter, session) => {
    const annotators = await Annotator.find(filter, null, {session});
    const annotations = [];

    for (const annotator of annotators) {
        const res = {};
        res[annotator._id] = await AnnotationService.deleteAnnotations(
            {annotator: annotator._id},
            session
        );
        annotations.push(res);
    }

    const deletedAnnotators = {annotations: annotations};

    deleteAnnotators.annotators = await Annotator.deleteMany(filter, {
        session,
    });

    return deletedAnnotators;
};

const deleteAnnotatorWithSession = async (id, session) => {
    const annotator = await Annotator.deleteOne({_id: id}, {session});
    const annotations = await AnnotationService.deleteAnnotations(
        {annotator: id},
        session
    );

    return {annotator: annotator, annotations: annotations};
};

const getAll = async () => {
    return Annotator.find();
};
const getAnnotatorsByRole = async (role) => {
    return Annotator.find({role: role});
};
const getAnnotatorsByBackground = async (background) => {
    return Annotator.find({background: background});
};

const getRole = async (id) => {
    const res = await Annotator.findById(id);
    return res?.role || null;
};

const getBackground = async (id) => {
    const res = await Annotator.findById(id);
    return res?.background || null;
};

const isHuman = async (id) => {
    const res = await Annotator.findById(id);
    return res?.isHuman || null;
};

const getHumanAnnotators = async () => {
    return Annotator.find({isHuman: true});
};
const getNotHumanAnnotators = async () => {
    return Annotator.find({isHuman: false});
};

const setHuman = async (id, human) => {
    await Annotator.updateOne({_id: id}, {isHuman: human});
};

const updateAnnotator = async (id, annotator) => {
    const found = await Annotator.exists({_id: id});

    if (!found) return null;

    return Annotator.updateOne({_id: id}, annotator, opts);
};

module.exports = {
    create,
    updateRole,
    updateBackground,
    deleteAnnotator,
    deleteAnnotators,
    getAll,
    getAnnotatorsByRole,
    getAnnotatorsByBackground,
    getRole,
    getBackground,
    isHuman,
    getHumanAnnotators,
    getNotHumanAnnotators,
    setHuman,
    updateAnnotator,
};
