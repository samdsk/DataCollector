const {Text} = require("../Models/Text");
const AnnotationService = require("./AnnotationService");
const TransactionWrapper = require("../Database/TransactionWrapper");

const opts = {runValidators: true};

const addLink = async (id, link) => {
    return Text.updateOne({_id: id}, {$push: {links: link}}, opts);
};

const updateLinks = async (id, links) => {
    return Text.updateOne({_id: id}, {links: links}, opts);
};

const getLinks = async (id) => {
    const res = await Text.findById(id);
    return res?.links || [];
};

const getLinkBySource = async (id, source) => {
    const links = await getLinks(id);
    for (const link of links) {
        if (link.source === source) return link.url;
    }
    return null;
};

const removeLinkBySource = async (id, link_source) => {
    return Text.updateOne(
        {_id: id},
        {$pull: {links: {source: link_source}}},
        opts
    );
};

const removeLinkByURL = async (id, link_url) => {
    return Text.updateOne(
        {_id: id},
        {$pull: {links: {url: link_url}}},
        opts
    );
};

const getTitle = async (id) => {
    const res = await Text.findById(id);
    return res?.title || null;
};

const updateTitle = async (id, title) => {
    return Text.updateOne({_id: id}, {title: title}, opts);
};

const getTextField = async (id) => {
    const res = await Text.findById(id);
    return res?.text || null;
};

const updateTextField = async (id, text) => {
    return Text.updateOne({_id: id}, {text: text}, opts);
};

const deleteOne = async (id, session) => {
    if (session) return await deleteTextWithSession(id, session);
    else
        return await TransactionWrapper.transactionWrapper(
            id,
            deleteTextWithSession
        );
};

const deleteMany = async (filter, session) => {
    if (session) return await deleteTextsWithSession(filter, session);
    else
        await TransactionWrapper.transactionWrapper(
            filter,
            deleteTextsWithSession
        );

    console.log("here rtaws");

};

const deleteTextWithSession = async (id, session) => {
    const res = {};

    res.text = await Text.deleteOne({_id: id}, {session});
    res.annotations = await AnnotationService.deleteAnnotations(
        {text: id},
        session
    );

    return res;
};

const deleteTextsWithSession = async (filter, session) => {
    const texts = await Text.find(filter, null, {session});
    const annotations = [];

    for (const text of texts) {
        const res = {};

        res[text._id] = await AnnotationService.deleteAnnotations(
            {text: text._id},
            session
        );

        annotations.push(res);
    }

    const deletedTexts = {annotations: annotations};

    deletedTexts.texts = await Text.deleteMany(filter, {
        session,
    });

    return deletedTexts;
};

const getDataProvider = async (id) => {
    const res = await Text.findById(id);
    return res?.data_provider || null;
};

const updateDataProvider = async (id, data_provider) => {
    return Text.updateOne(
        {_id: id},
        {data_provider: data_provider},
        opts
    );
};

const getByDataProvider = async (data_provider, type) => {
    if (type) return Text.find({data_provider: data_provider, __t: type});
    return Text.find({data_provider: data_provider});
};

const getAuthor = async (id) => {
    const res = await Text.findById(id);
    return res?.author || null;
};

const getByAuthor = async (author) => {
    return Text.find({author: author});
};

const updateAuthor = async (id, author) => {
    return Text.updateOne({_id: id}, {author: author}, opts);
};

const getLanguageTag = async (id) => {
    const res = await Text.findById(id);
    return res?.icu_locale_language_tag || null;
};

const getByLanguageTag = async (icu_locale_language_tag, type) => {
    if (type)
        return Text.find({
            icu_locale_language_tag: icu_locale_language_tag,
            __t: type,
        });

    return Text.find({
        icu_locale_language_tag: icu_locale_language_tag,
    });
};

const updateLanguageTag = async (id, icu_locale_language_tag) => {
    return Text.updateOne(
        {_id: id},
        {icu_locale_language_tag: icu_locale_language_tag},
        opts
    );
};

module.exports = {
    addLink,
    getLinks,
    getLinkBySource,
    updateLinks,
    removeLinkBySource,
    removeLinkByURL,
    getTitle,
    updateTitle,
    getTextField,
    updateTextField,
    deleteOne,
    deleteMany,
    getDataProvider,
    updateDataProvider,
    getByDataProvider,
    getAuthor,
    getByAuthor,
    updateAuthor,
    getLanguageTag,
    getByLanguageTag,
    updateLanguageTag,
};
