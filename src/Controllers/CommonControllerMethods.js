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

    const matchStage = {};
    if (filterBy && filterValue) {
        matchStage[filterBy] = {$regex: filterValue, $options: "i"};
    }

    const sort = {};
    sort[sortBy] = order === "desc" ? -1 : 1;

    let projectStage = null;
    if (fields) {
        projectStage = {};
        const fieldList = fields.split(',').map(f => f.trim());
        for (const field of fieldList) {
            if (field) {
                projectStage[field] = 1;
            }
        }
    }

    // Build aggregation pipeline
    const pipeline = [];

    if (Object.keys(matchStage).length > 0) {
        pipeline.push({ $match: matchStage });
    }

    // Add facet to get both count and results in one query
    pipeline.push({
        $facet: {
            totalCount: [{ $count: "count" }],
            results: [
                { $sort: sort },
                { $skip: (page - 1) * limit },
                { $limit: limit },
                { $project: projectStage }
            ]
        }
    });

    const aggregationResult = await MODEL.aggregate(pipeline, { allowDiskUse: true });

    const total_documents = aggregationResult[0].totalCount[0]?.count || 0;
    const total_pages = Math.ceil(total_documents / limit);
    const results = aggregationResult[0].results || [];

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
