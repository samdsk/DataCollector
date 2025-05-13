const {connect, close, clearDatabase} = require("../db_handler");
const mongoose = require("mongoose");

const {Annotator} = require("../../src/Models/Annotator");
const {Role} = require("../../src/Models/Role");
const {Background} = require("../../src/Models/Background");

const delete_list = ["annotators"];

const role_1 = {
    role: "Role_1",
    reliability_score: 3,
};

const background_1 = {
    background: "Background_1",
};

let role = null;
let background = null;

describe("Annotator Model", () => {
    beforeAll(async () => {
        await connect();
        background = await Background.create(background_1);
        role = await Role.create(role_1);
    });

    afterAll(async () => {
        await close();
    });

    afterEach(async () => {
        await clearDatabase(delete_list);
    });

    test("Valid Annotator", async () => {
        const annotator = {
            _id: "test1",
            role: role._id,
            background: background._id,
            isHuman: true,
        };
        await expect(Annotator.create(annotator)).resolves.not.toThrow();
    });

    test("Invalid role id", async () => {
        const annotator = {
            _id: "test1",
            role: new mongoose.Types.ObjectId(),
            background: background._id,
            isHuman: false,
        };
        await expect(Annotator.create(annotator)).rejects.toThrow(
            "Annotator validation failed: role: Invalid Role"
        );
    });

    test("Invalid background id", async () => {
        const annotator = {
            _id: "test1",
            role: role._id,
            background: new mongoose.Types.ObjectId(),
            isHuman: true,
        };
        await expect(Annotator.create(annotator)).rejects.toThrow(
            "Annotator validation failed: background: Invalid Background"
        );
    });

    test("Duplicate Annotator", async () => {
        const annotator = {
            _id: "test1",
            role: role._id,
            background: background._id,
            isHuman: true,
        };

        await Annotator.create(annotator);

        try {
            await Annotator.create(annotator);
        } catch (e) {
            expect(e.message.startsWith("E11000 duplicate")).toBe(true);
        }
    });
});
