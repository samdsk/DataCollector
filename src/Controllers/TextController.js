const Text = require("../Models/Text");
const {searchMultiple, searchSingle} = require("./CommonControllerMethods");
const RequestError = require("../Errors/RequestError");
const TextService = require("../Services/TextService");

const searchText = async (req, res, next) => {
    try {
        const result = await searchMultiple(req, Text.Text);
        return res.json(result);
    } catch (error) {
        next(error);
    }
};

const getText = async (req, res, next) => {
    try {
        const result = await searchSingle(req, Text.Text);
        return res.json(result);
    } catch (error) {
        next(error);
    }
};

const addLink = async (req, res, next) => {
    const id = req.body.id || "";
    const link = req.body.link || "";

    if (!id) return next(new RequestError("id is required"));
    if (!link) return next(new RequestError("link is required"));

    try {
        const result = await TextService.addLink(id, link);
        return res.json({success: true, result: result});
    } catch (error) {
        next(error);
    }
}

const removeLinkBySource = async (req, res, next) => {
    const id = req.body.id || "";
    const link_source = req.body.link_source || "";

    if (!id) return next(new RequestError("id is required"));
    if (!link_source) return next(new RequestError("link_source is required"));
    try {
        const result = await TextService.removeLinkBySource(id, link_source);
        return res.json({success: true, result: result});
    } catch (error) {
        next(error);
    }
}
const removeLinkByURL = async (req, res, next) => {
    const id = req.body.id || "";
    const link_url = req.body.link_url || "";

    if (!id) return next(new RequestError("id is required"));
    if (!link_url) return next(new RequestError("link_url is required"));
    try {
        const result = await TextService.removeLinkByURL(id, link_url);
        return res.json({success: true, result: result});
    } catch (error) {
        next(error);
    }
}

module.exports = {
    searchText,
    getText,
    addLink,
    removeLinkBySource,
    removeLinkByURL
};
