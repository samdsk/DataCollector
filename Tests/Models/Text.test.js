const {connect, close, clearDatabase} = require("../db_handler");

const {Text} = require("../../src/Models/Text");
const {default: mongoose} = require("mongoose");
const {DataProvider} = require("../../src/Models/DataProvider");

const delete_list = ["texts"];

const text = {
    _id: "test_1",
    text: "Description_1",
    title: "Title_1",
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

let data_provider;

describe("Text Model", () => {
    beforeAll(async () => {
        await connect();
        data_provider = await DataProvider.create({data_provider: "RapidAPI"});
        text.data_provider = data_provider._id;
    });

    afterAll(async () => {
        await close();
    });

    afterEach(async () => {
        await clearDatabase(delete_list);
    });

    test("Valid Text", async () => {
        await expect(Text.create(text)).resolves.not.toThrow();
    });

    test("Invalid Data Source", async () => {
        const text_1 = {...text};

        text_1.data_provider = new mongoose.Types.ObjectId();
        await expect(Text.create(text_1)).rejects.toThrow(
            "Text validation failed: data_provider: Invalid Data Provider"
        );
    });

    test("Invalid url", async () => {
        const text_1 = {...text};
        text_1.links = [
            {
                source: "source 1",
                url: "examplecom",
            },
            {
                source: "source 2",
                url: "http://hhwexample.com",
            },
        ];
        await expect(Text.create(text_1)).rejects.toThrow(
            "Text validation failed: links: Invalid link url 'examplecom'"
        );
    });

    test("Invalid Language tag", async () => {
        const text_1 = {...text};
        text_1.icu_locale_language_tag = "it-EN";
        await expect(Text.create(text_1)).rejects.toThrow(
            "Text validation failed: icu_locale_language_tag: Invalid ICU locale language tag : it-EN"
        );
    });

    test("Duplicate source", async () => {
        const text_1 = {...text};

        text_1.links = [
            {
                source: "source 1",
                url: "example.com",
            },
            {
                source: "source 1",
                url: "http://hhwexample.com",
            },
        ];
        await expect(Text.create(text_1)).rejects.toThrow(
            "Text validation failed: links: Duplicate link source 'source 1'"
        );
    });
});
