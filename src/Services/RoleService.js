const AnnotatorService = require("./AnnotatorService");
const Role = require("../Models/Role");
const TransactionWrapper = require("../Database/TransactionWrapper");

const opts = {runValidators: true};

const create = async (role) => {
    const found = await Role.Role.exists({
        role: role.role,
    });

    if (found) return null;
    return Role.Role.create(role);
};

const updateReliabilityScore = async (id, score) => {
    return Role.Role.updateOne(
        {_id: id},
        {reliability_score: score},
        opts
    );
};

const deleteRole = async (id, session) => {
    if (session) {
        return await deleteOperation(id, session);
    } else {
        return await TransactionWrapper.transactionWrapper(id, deleteOperation);
    }
};

const deleteOperation = async (id, session) => {
    const role = await Role.Role.deleteOne({_id: id}, {session});
    const annotators = await AnnotatorService.deleteAnnotators(
        {role: id},
        session
    );
    return {role: role, annotators};
};

const getAll = async () => {
    return Role.Role.find();
};
const getRolesByReliabilityScore = async (score) => {
    return Role.Role.find({reliability_score: score});
};
const getRole = async (id) => {
    const res = await Role.Role.findById(id);
    return res?.role || null;
};
const getReliabilityScore = async (id) => {
    const res = await Role.Role.findById(id);
    return res?.reliability_score || null;
};

const updateRole = async (id, role) => {
    const found = await Role.Role.exists({_id: id});

    if (!found) return null;

    return Role.Role.updateOne({_id: id}, role, opts);
};

module.exports = {
    create,
    updateReliabilityScore,
    deleteRole,
    getAll,
    getRolesByReliabilityScore,
    getRole,
    getReliabilityScore,
    updateRole,
};
