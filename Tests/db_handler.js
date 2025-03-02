require("dotenv").config();

const {
    MongoMemoryServer,
    MongoMemoryReplSet,
} = require("mongodb-memory-server");
const mongoose = require("mongoose");

let mongo = null;

const connect = async () => {
    mongo = await MongoMemoryServer.create();
    const uri = mongo.getUri();
    await mongoose.connect(uri);
};

const close = async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongo.stop();
};

const clearDatabase = async (delete_list) => {
    const collections = await mongoose.connection.db.collections();
    for (const collection of collections) {
        if (delete_list.includes(collection.collectionName)) {
            await collection.deleteMany();
        }
    }
};

module.exports = {
    connect,
    close,
    clearDatabase,
};
