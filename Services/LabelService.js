const {Label} = require("../Models/Label");
const AnnotationService = require("./AnnotationService");
const TransactionWrapper = require("../Database/TransactionWrapper");
const ValidationError = require("../Errors/ValidationError");

const opts = {runValidators: true};

const create = async (label) => {
    if (typeof label !== "string")
        throw new ValidationError("must be a string", "Label", "label");

    const found = await Label.exists({label: label});
    if (found) return null;

    return await Label.create({label: label});
};

const deleteLabel = async (id, session) => {
    if (session) {
        return await deleteOperation(id, session);
    } else {
        return await TransactionWrapper.transactionWrapper(id, deleteOperation);
    }
};

const deleteOperation = async (id, session) => {
    const label = await Label.deleteOne({_id: id}, {session});
    const annotation = await AnnotationService.deleteAnnotations(
        {label: id},
        session
    );
    return {label: label, annotation};
};

const getAll = async () => {
    return Label.find();
};

const getLabel = async (id) => {
    const res = await Label.findById(id);
    return res?.label || null;
};

const updateLabel = async (id, label) => {
    const found = await Label.exists({_id: id});
    if (!found) return null;

    return Label.updateOne({_id: id}, {label: label}, opts);
};

module.exports = {create, deleteLabel, getAll, getLabel, updateLabel};
