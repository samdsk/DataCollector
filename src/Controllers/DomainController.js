const Domain = require("../Models/Domain");
const DomainService = require("../Services/DomainService");
const {
    searchMultiple,
    searchSingle,
    createSimpleDocument,
} = require("./CommonControllerMethods");
const RequestError = require("../Errors/RequestError");

const searchDomain = async (req, res, next) => {
    try {
        const result = await searchMultiple(req, Domain.Domain);
        return res.json(result);
    } catch (error) {
        next(error);
    }
};

const getDomain = async (req, res, next) => {
    try {
        const result = await searchSingle(req, Domain.Domain);
        return res.json(result);
    } catch (error) {
        next(error);
    }
};

const createDomain = async (req, res, next) => {
    const domain = req.body.domain || "";

    try {
        if (!domain) return next(new RequestError("domain is required"));
        const result = await createSimpleDocument(domain, DomainService.create);
        return res.json(result);
    } catch (error) {
        next(error);
    }
};

const updateDomain = async (req, res, next) => {
    const domain = req.body.domain || "";
    const id = req.body.id || "";

    try {
        if (!domain || !id)
            return next(new RequestError("id and domain are required"));

        const result = await DomainService.updateDomain(id, domain);

        if (result === null) return next(new RequestError(`Update operation failed`));

        return res.json({success: true});
    } catch (error) {
        next(error);
    }
};

const deleteDomain = async (req, res, next) => {
    const id = req.body.id || "";
    try {
        if (!id) return next(new RequestError("id is required"));

        const result = await DomainService.deleteDomain(id);

        if (result === null) return next(new RequestError(`Delete operation failed`));

        return res.json({success: true, result: result});
    } catch (error) {
        next(error);
    }
};

module.exports = {
    searchDomain,
    getDomain,
    createDomain,
    updateDomain,
    deleteDomain,
};
