const mongoose = require("mongoose");
const Utils = require("../Library/Utils");

require("dotenv").config();

// beforeAll(async () => {
//   await mongoose.connect(process.env.DB_URL_DUP_TEST);
//   console.log("connected");
// });

// afterAll(async () => {
//   await mongoose.connection.close();
// });

// beforeEach(async () => {
//   const collections = await mongoose.connection.db.collections();
//   for (const collection of collections) await collection.drop();
// });

describe("asd", () => {
    it.skip("Should not contain files that doesn't start with results", async () => {
        const files = await Utils.getResultFiles();
        const n = files.filter((file) => !file.startsWith("results"));
        expect(n.length).toBe(0);
    });

    it.skip("transferDatabase", async () => {
        const res = await Utils.transferDataBase(process.env.DB_URL_TEST);
        expect(res.total).toEqual(res.count);
    });
});
