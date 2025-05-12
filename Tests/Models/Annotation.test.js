const {connect, close, clearDatabase} = require("../db_handler");
const mongoose = require("mongoose");

const {Annotator} = require("../../src/Models/Annotator");
const {Role} = require("../../src/Models/Role");
const {Background} = require("../../src/Models/Background");
const {Domain} = require("../../src/Models/Domain");
const {Text} = require("../../src/Models/Text");
const {Label} = require("../../src/Models/Label");
const {Annotation} = require("../../src/Models/Annotation");
const {DataProvider} = require("../../src/Models/DataProvider");

const delete_list = ["annotations"];

const role_1 = {
    role: "Role_1",
    reliability_score: 3,
};

const background_1 = {
    background: "Background_1",
};

const annotator_1 = {
    _id: "Annotator_1",
    isHuman: true,
};

const domain_1 = {
    domain: "Domain_1",
};

const label_1 = {
    label: "Label_1",
};

const text_1 = {
    _id: "test_1",
    title: "title_1",
    text: "Description_1",
    links: [
        {
            source: "source 1",
            url: "example.com",
        },
        {
            source: "source 2",
            url: "http://hhwexample.com",
        },
    ],
    icu_locale_language_tag: "it-IT",
};

const data_provider_1 = {
    data_provider: "DataProvider_1",
};

let role = null;
let background = null;
let annotator = null;
let domain = null;
let text = null;
let label = null;
let data_provider = null;

describe("Annotation Models", () => {
    beforeAll(async () => {
        await connect();
        background = await Background.create(background_1);
        role = await Role.create(role_1);

        annotator_1.role = role.id;
        annotator_1.background = background.id;
        data_provider = await DataProvider.create(data_provider_1);
        annotator = await Annotator.create(annotator_1);
        domain = await Domain.create(domain_1);
        label = await Label.create(label_1);

        text_1.data_provider = data_provider._id;
        text = await Text.create(text_1);
    });

    afterAll(async () => {
        await close();
    });

    afterEach(async () => {
        await clearDatabase(delete_list);
    });

    test("Valid Annotation", async () => {
        const annotation = {
            text: text._id,
            label: label._id,
            domain: domain._id,
            annotator: annotator._id,
            reason: "Reason_1",
            tokens: ["token1", "token2"],
        };

        await expect(Annotation.create(annotation)).resolves.not.toThrow();
    });

    test("Duplicate Annotation", async () => {
        const annotation = {
            text: text._id,
            label: label._id,
            domain: domain._id,
            annotator: annotator._id,
            reason: "Reason_1",
            tokens: ["token1", "token2"],
        };

        const annotation_2 = {...annotation, reason: "Reason_2"};

        await Annotation.create(annotation);
        try {
            await Annotation.create(annotation_2);
        } catch (e) {
            expect(e.message.startsWith("E11000 duplicate")).toBe(true);
        }
    });
    test("Invalid text", async () => {
        const annotation = {
            text: "job.id",
            annotator: annotator.id,
            label: label.id,
            reason: "Reason_1",
            domain: domain.id,
        };
        await expect(Annotation.create(annotation)).rejects.toThrow(
            "Annotation validation failed: text: Invalid Text"
        );
    });

    test("Invalid annotator", async () => {
        const annotation = {
            text: text.id,
            annotator: new mongoose.Types.ObjectId(),
            label: label.id,
            reason: "Reason_1",
            domain: domain.id,
        };
        await expect(Annotation.create(annotation)).rejects.toThrow(
            "Annotation validation failed: annotator: Invalid Annotator"
        );
    });
    test("Invalid label", async () => {
        const annotation = {
            text: text.id,
            annotator: annotator.id,
            label: new mongoose.Types.ObjectId(),
            reason: "Reason_1",
            domain: domain.id,
        };
        await expect(Annotation.create(annotation)).rejects.toThrow(
            "Annotation validation failed: label: Invalid Label"
        );
    });
    test("Invalid domain", async () => {
        const annotation = {
            text: text.id,
            annotator: annotator.id,
            label: label.id,
            reason: "Reason_1",
            domain: new mongoose.Types.ObjectId(),
        };
        await expect(Annotation.create(annotation)).rejects.toThrow(
            "Annotation validation failed: domain: Invalid Domain"
        );
    });
});
