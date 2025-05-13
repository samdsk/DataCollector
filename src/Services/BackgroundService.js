const AnnotatorService = require("./AnnotatorService");
const Background = require("../Models/Background");
const TransactionWrapper = require("../Database/TransactionWrapper");
const ValidationError = require("../Errors/ValidationError");

const opts = {runValidators: true};

const create = async (background) => {
    if (typeof background !== "string")
        throw new ValidationError("must be a string", "Background", "background");

    const found = await Background.Background.exists({background: background});
    if (found) return null;

    return await Background.Background.create({background: background});
};

const deleteBackground = async (id, session) => {
    if (session) {
        return await deleteOperation(id, session);
    } else {
        return await TransactionWrapper.transactionWrapper(id, deleteOperation);
    }
};

const deleteOperation = async (id, session) => {
    const background = await Background.Background.deleteOne(
        {_id: id},
        {session}
    );
    const annotators = await AnnotatorService.deleteAnnotators(
        {background: id},
        session
    );
    return {background: background, annotators};
};

const getAll = async () => {
    return Background.Background.find();
};

const getBackground = async (id) => {
    const res = await Background.Background.findById(id);
    return res?.background || null;
};

const updateBackground = async (id, background) => {
    const found = await Background.Background.exists({_id: id});
    if (!found) return null;

    return Background.Background.updateOne(
        {_id: id},
        {background: background, opts}
    );
};

module.exports = {
    create,
    deleteBackground,
    getAll,
    getBackground,
    updateBackground,
};
