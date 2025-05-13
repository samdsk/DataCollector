const {Collection} = require("../Models/Collection");
const TransactionWrapper = require("../Database/TransactionWrapper");
const TextService = require("./TextService");
const {Annotation} = require("../Models/Annotation");

const opts = {runValidators: true};

const create = async (collection) => {
    const found = await Collection.exists({collection_name: collection.collection_name});

    if (found) return null;

    return Collection.create(collection);
};

const addText = async (id, text) => {
    return Collection.updateOne({_id: id}, {$push: {texts: text}}, opts);
};
const removeText = async (id, text) => {
    return Collection.updateOne({_id: id}, {$pull: {texts: text}}, opts);
};

const getName = async (id) => {
    const res = await Collection.findById(id);
    return res?.collection_name || null;
};

const getTexts = async (id) => {
    const res = await Collection.findById(id);
    return res?.texts || [];
};

const deleteCollection = async (id, session) => {
    if (session) {
        return await deleteOperation(id, session);
    } else {
        return await TransactionWrapper.transactionWrapper(id, deleteOperation);
    }
};

const deleteOperation = async (id, session) => {
    return Collection.deleteOne({_id: id}, {session});
};

const updateCollection = async (id, collection) => {
    const found = await Collection.exists({_id: id});

    if (!found) return null;

    return Collection.updateOne(
        {_id: id},
        collection,
        opts
    );
}

module.exports = {
    create,
    addText,
    removeText,
    getName,
    getTexts,
    deleteCollection,
    updateCollection
};
