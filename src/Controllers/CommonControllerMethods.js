const RequestError = require("../Errors/RequestError");

const searchMultiple = async (req, MODEL) => {
    const searchParams = req.query || "";
    if (!searchParams)
        throw new RequestError("Url query string is required");

    const filterBy = searchParams.by || "";
    const filterValue = searchParams.value || "";
    const fields = searchParams.fields || "";
    const sortBy = searchParams.sort || "createdAt";
    const order = searchParams.order || "desc";
    const page = parseInt(searchParams.page) || 1;
    const limit = parseInt(searchParams.limit) || 20;

    const query = {};
    let select = fields.replaceAll(",", " ");

    if (filterBy && filterValue) {
        query[filterBy] = {$regex: filterValue, $options: "i"};
    }

    const sort = {};
    sort[sortBy] = order === "desc" ? -1 : 1;

    const total_documents = await MODEL.countDocuments(query);
    const total_pages = Math.ceil(total_documents / limit);

    const results = await MODEL.find(query)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .select(select)
        .lean();

    results.forEach((element) => {
        element.__t = undefined;
        element.__v = undefined;
    });

    return {
        success: true,
        page: page,
        limit: limit,
        total_documents: total_documents,
        total_pages: total_pages,
        results: results,
    };
};

const searchSingle = async (req, MODEL) => {
    const query = req.query || "";
    if (!query) throw new RequestError("Url query string is required");

    const id = decodeURIComponent(query.id || "");
    const fields = decodeURIComponent(query.fields || "");

    if (!id) throw new RequestError("id field is required");

    const select = fields.replaceAll(",", " ");

    const result = await MODEL.findById(id).select(select).lean();

    if (result) {
        result.__t = undefined;
        result._id = undefined;
        result.__v = undefined;
    }

    return {success: true, results: result ? result : {}};
};

const createSimpleDocument = async (object, createMethod) => {
    const result = await createMethod(object);

    if (result === null)
        throw new RequestError(`Create operation failed, possible duplication`);

    result.__v = undefined;

    return {success: true, result: result};
};

module.exports = {searchMultiple, searchSingle, createSimpleDocument};
