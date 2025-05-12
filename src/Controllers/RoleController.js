const Role = require("../Models/Role");
const RoleService = require("../Services/RoleService");
const {
    searchMultiple,
    searchSingle,
    createSimpleDocument,
} = require("./CommonControllerMethods");
const RequestError = require("../Errors/RequestError");

const searchRole = async (req, res, next) => {
    try {
        const result = await searchMultiple(req, Role.Role);
        return res.json(result);
    } catch (error) {
        next(error);
    }
};

const getRole = async (req, res, next) => {
    try {
        const result = await searchSingle(req, Role.Role);
        return res.json(result);
    } catch (error) {
        next(error);
    }
};

const createRole = async (req, res, next) => {
    const role = req.body.role || "";
    const reliability_score = req.body.reliability_score || "";
    try {
        if (!reliability_score)
            return next(new RequestError("reliability_score is required"));

        const result = await createSimpleDocument(
            {role: role, reliability_score: parseInt(reliability_score)},
            RoleService.create
        );
        return res.json(result);
    } catch (error) {
        next(error);
    }
};

const updateRole = async (req, res, next) => {
    const role = req.body.role || "";
    const reliability_score = req.body.reliability_score || "";
    const id = req.body.id || "";

    try {
        if (!id) return next(new RequestError("id is required"));
        const update = {};

        if (role) update.role = role;
        if (reliability_score)
            update.reliability_score = parseInt(reliability_score);

        const result = await RoleService.updateRole(id, update);

        if (result == null) return next(new RequestError(`Update operation failed`));

        return res.json({success: true});
    } catch (error) {
        next(error);
    }
};

const deleteRole = async (req, res, next) => {
    const id = req.body.id || "";
    try {
        if (!id) return next(new RequestError("id is required"));

        const result = await RoleService.deleteRole(id);

        if (result === null) return next(new RequestError(`Delete operation failed`));

        return res.json({success: true, result: result});
    } catch (error) {
        next(error);
    }
};

module.exports = {
    searchRole,
    getRole,
    createRole,
    updateRole,
    deleteRole,
};
