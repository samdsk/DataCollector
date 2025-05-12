const {connect, close, clearDatabase} = require("../db_handler");

const {DataProvider} = require("../../src/Models/DataProvider");

const delete_list = ["dataproviders"];

describe("DataProvider Model", () => {
    beforeAll(async () => {
        await connect();
    });

    afterAll(async () => {
        await close();
    });

    afterEach(async () => {
        await clearDatabase(delete_list);
    });

    test("Valid DataProvider", async () => {
        const data_provider = {
            data_provider: "DataProvider1",
        };
        await expect(DataProvider.create(data_provider)).resolves.not.toThrow();
    });

    test("Get Data Providers id by name", async () => {
        const name = "DataProvider1";
        const data_provider = {
            data_provider: name,
        };

        const created = await DataProvider.create(data_provider);
        const result = await DataProvider.findOne({data_provider: name}).select(
            "_id"
        );

        expect(result._id).toEqual(created._id);
    });

    test("Duplicate DataProvider", async () => {
        const data_provider = {
            data_provider: "DataProvider1",
        };

        await DataProvider.create(data_provider);
        await DataProvider.syncIndexes();

        try {
            await DataProvider.create(data_provider);
        } catch (e) {
            expect(e.message.startsWith("E11000 duplicate")).toBe(true);
        }
    });
});
