const {Domain} = require("../Models/Domain");
const AnnotationService = require("./AnnotationService");
const TransactionWrapper = require("../Database/TransactionWrapper");
const ValidationError = require("../Errors/ValidationError");

const opts = {runValidators: true};

const create = async (domain) => {
    if (typeof domain !== "string")
        throw new ValidationError("must be a string", "Domain", "domain");

    const found = await Domain.exists({domain: domain});
    if (found) return null;

    return await Domain.create({domain: domain});
};

const deleteDomain = async (id, session) => {
    if (session) {
        return await deleteOperation(id, session);
    } else {
        return await TransactionWrapper.transactionWrapper(id, deleteOperation);
    }
};

const deleteOperation = async (id, session) => {
    const domain = await Domain.deleteOne({_id: id}, {session});
    const annotation = await AnnotationService.deleteAnnotations(
        {domain: id},
        session
    );
    return {domain: domain, annotation};
};

const getAll = async () => {
    return Domain.find();
};

const getDomain = async (id) => {
    const res = await Domain.findById(id);
    return res?.domain || null;
};

const updateDomain = async (id, domain) => {
    const found = await Domain.exists({_id: id});
    if (!found) return null;

    return Domain.updateOne({_id: id}, {domain: domain}, opts);
};

module.exports = {create, deleteDomain, getAll, getDomain, updateDomain};
