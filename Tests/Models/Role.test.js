const {connect, close, clearDatabase} = require("../db_handler");

const {Role} = require("../../src/Models/Role");
const {default: mongoose} = require("mongoose");

const delete_list = ["roles"];

describe("Role Model", () => {
    beforeAll(async () => {
        await connect();
    });

    afterAll(async () => {
        await close();
    });

    afterEach(async () => {
        await clearDatabase(delete_list);
    });

    test("Valid Role", async () => {
        const role = {
            role: "Role1",
            reliability_score: 5,
        };
        await expect(Role.create(role)).resolves.not.toThrow();
    });

    test("Duplicate Role", async () => {
        const role = {
            role: "Role1",
            reliability_score: 5,
        };

        await Role.create(role);
        await Role.syncIndexes();

        try {
            await Role.create(role);
        } catch (e) {
            expect(e.message.startsWith("E11000 duplicate")).toBe(true);
        }
    });

    test("Negative Reliability Score", async () => {
        const role = {
            role: "Role1",
            reliability_score: -1,
        };

        await expect(Role.create(role)).rejects.toThrow(
            "Role validation failed: reliability_score: reliability_score can't be negative"
        );
    });
    test("Reliability Score greater than 10", async () => {
        const role = {
            role: "Role1",
            reliability_score: 11,
        };

        await expect(Role.create(role)).rejects.toThrow(
            "Role validation failed: reliability_score: reliability_score can't be grater than 10"
        );
    });
});
