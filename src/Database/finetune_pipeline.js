module.exports = [
    {
        $lookup: {
            from: "texts",
            localField: "text",
            foreignField: "_id",
            as: "text",
        },
    },
    {
        $lookup: {
            from: "labels",
            localField: "label",
            foreignField: "_id",
            as: "label",
        },
    },
    {
        $lookup: {
            from: "domains",
            localField: "domain",
            foreignField: "_id",
            as: "domain",
        },
    },
    {
        $unwind: "$text",
    },
    {
        $unwind: "$domain",
    },
    {
        $unwind: "$label",
    },
    {
        $group: {
            _id: "$_id",
            text_id: {
                $first: "$text._id",
            },
            text: {
                $first: "$text.text",
            },
            label: {
                $first: "$label.label",
            },
            domain: {
                $first: "$domain.domain",
            },
            reason: {
                $first: "$reason",
            },
            tokens: {
                $first: "$tokens",
            },
            icu_locale_language_tag: {
                $first: "$text.icu_locale_language_tag",
            },
            createdAt: {
                $first: "$createdAt",
            },
            updatedAt: {
                $first: "$updatedAt",
            },
        },
    },
];
