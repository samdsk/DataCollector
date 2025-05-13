const {connect, close, clearDatabase} = require("../db_handler");

const {Background} = require("../../src/Models/Background");

const delete_list = ["backgrounds"];

describe("Background Model", () => {
    beforeAll(async () => {
        await connect();
    });

    afterAll(async () => {
        await close();
    });

    afterEach(async () => {
        await clearDatabase(delete_list);
    });

    test("Valid Background", async () => {
        const background = {
            background: "Background1",
        };
        await expect(Background.create(background)).resolves.not.toThrow();
    });

    test("Duplicate Background", async () => {
        const background = {
            background: "Background1",
        };

        await Background.create(background);
        await Background.syncIndexes();

        try {
            await Background.create(background);
        } catch (e) {
            expect(e.message.startsWith("E11000 duplicate")).toBe(true);
        }
    });
});
