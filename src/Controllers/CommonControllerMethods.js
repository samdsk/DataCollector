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

    // Build projection stage - only if fields are specified
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

    // Create results pipeline stages
    const resultsPipeline = [
        { $sort: sort },
        { $skip: (page - 1) * limit },
        { $limit: limit }
    ];

    // Only add project stage if it's not null
    if (projectStage !== null) {
        resultsPipeline.push({ $project: projectStage });
    }

    // Add facet to get both count and results in one query
    pipeline.push({
        $facet: {
            totalCount: [{ $count: "count" }],
            results: resultsPipeline
        }
    });

    // Filter out any null or undefined values from the pipeline
    const cleanPipeline = pipeline.map(stage => {
        if (stage && typeof stage === 'object') {
            // Remove null/undefined values from each stage
            return JSON.parse(JSON.stringify(stage, (key, value) => {
                return value === null || value === undefined ? undefined : value;
            }));
        }
        return stage;
    }).filter(stage => stage !== null && stage !== undefined);

    const aggregationResult = await MODEL.aggregate(cleanPipeline, { allowDiskUse: true });

    const total_documents = aggregationResult[0]?.totalCount[0]?.count || 0;
    const total_pages = Math.ceil(total_documents / limit);
    const results = aggregationResult[0]?.results || [];

    // Clean up results - only remove __v, keep __t for discriminators
    results.forEach((element) => {
        if (element) {
            element.__v = undefined;
        }
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
