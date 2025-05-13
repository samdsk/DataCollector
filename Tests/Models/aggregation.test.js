require("dotenv").config();

const mongoose = require("mongoose");

const pipeline = require("../../src/Database/finetune_pipeline");

const {Annotation} = require("../../src/Models/Annotation");
const {Annotator} = require("../../src/Models/Annotator");
const {Background} = require("../../src/Models/Background");
const {Domain} = require("../../src/Models/Domain");
const {JobPost} = require("../../src/Models/JobPost");
const {Label} = require("../../src/Models/Label");
const {Role} = require("../../src/Models/Role");
const OutputLLM = require("../../src/Models/OutputLLM");
const {DataProvider} = require("../../src/Models/DataProvider");

const init_setup = async () => {
    const role_1 = {
        role: "Role_1",
        reliability_score: 3,
    };
    const role_2 = {
        role: "Role_2",
        reliability_score: 10,
    };

    const background_1 = {
        background: "Background_1",
    };
    const background_2 = {
        background: "Background_2",
    };

    const annotator_1 = {
        _id: "annotator1",
        isHuman: false,
    };

    const annotator_2 = {
        _id: "annotator2",
        isHuman: true,
    };

    const domain_1 = {
        domain: "Domain_1",
    };
    const domain_2 = {
        domain: "Domain_2",
    };

    const label_1 = {
        label: "Label_1",
    };
    const label_2 = {
        label: "Label_2",
    };

    const job_1 = {
        _id: "text_1",
        job_type: "JobType_1",
        title: "Title_1",
        company: "Company_1",
        location: "Location_1",
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

    const job_2 = {
        _id: "text_2",
        job_type: "JobType_2",
        title: "Title_2",
        company: "Company_2",
        location: "Location_2",
        text: "Description_2",
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
        icu_locale_language_tag: "en-GB",
    };

    const data_provider_1 = {
        data_provider: "RapidAPI",
    };
    const data_provider_2 = {
        data_provider: "BrandWatch",
    };

    let role;
    let background;
    let annotator;
    let domain;
    let job;
    let label;
    let data_provider;

    background = await Background.create(background_1);
    role = await Role.create(role_1);

    annotator_1.role = role.id;
    annotator_1.background = background.id;

    annotator = await Annotator.create(annotator_1);
    domain = await Domain.create(domain_1);
    label = await Label.create(label_1);

    data_provider = await DataProvider.create(data_provider_1);
    job_1.data_provider = data_provider._id;

    job = await JobPost.create(job_1);

    const annotation_1 = {
        text: job._id,
        annotator: annotator._id,
        label: label._id,
        reason: "Reason_1",
        domain: domain._id,
        tokens: ["token1", "token2"],
    };

    await Annotation.create(annotation_1);

    background = await Background.create(background_2);
    role = await Role.create(role_2);

    annotator_2.role = role.id;
    annotator_2.background = background.id;

    annotator = await Annotator.create(annotator_2);
    domain = await Domain.create(domain_2);
    label = await Label.create(label_2);

    data_provider = await DataProvider.create(data_provider_2);
    job_2.data_provider = data_provider._id;
    job = await JobPost.create(job_2);

    const annotation_2 = {
        text: job._id,
        annotator: annotator._id,
        label: label._id,
        reason: "Reason_2",
        domain: domain._id,
        tokens: ["token3", "token4"],
    };

    await Annotation.create(annotation_2);
};

describe("MongoDB aggregation pipeline:", () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.DB_URL_TEST);
        await mongoose.connection.db.dropDatabase();
        await mongoose.connection.db.createCollection("outputllms", {
            viewOn: "annotations",
            pipeline: pipeline,
        });
        await init_setup();
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    it("create view finetunes", async () => {
        const res = await OutputLLM.find();
        expect(res.length).toEqual(2);
    });

    it("add to annotation and update view", async () => {
        const role_3 = {
            role: "Role_3",
            reliability_score: 6,
        };
        const background_3 = {
            background: "Background_3",
        };
        const annotator_3 = {
            _id: "annotator3",
            isHuman: true,
        };
        const domain_3 = {
            domain: "Domain_3",
        };

        const label_3 = {
            label: "Label_3",
        };
        let data_provider = await DataProvider.findOne({
            data_provider: "RapidAPI",
        });

        const job_3 = {
            _id: "text_3",
            job_type: "JobType_3",
            title: "Title_3",
            company: "Company_3",
            location: "Location_3",
            text: "Description_3",
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
            data_provider: data_provider._id,
        };

        let background = await Background.create(background_3);
        let role = await Role.create(role_3);

        annotator_3.role = role.id;
        annotator_3.background = background.id;

        let annotator = await Annotator.create(annotator_3);
        let domain = await Domain.create(domain_3);
        let label = await Label.create(label_3);
        let job = await JobPost.create(job_3);

        const annotation_3 = {
            text: job._id,
            annotator: annotator._id,
            label: label._id,
            reason: "Reason_3",
            domain: domain._id,
            tokens: ["token5", "token6"],
        };

        await Annotation.create(annotation_3);

        const res = await OutputLLM.find({text_id: job._id});

        expect(res[0].reason).toEqual(annotation_3.reason);
    });

    it("Update", async () => {
        await Annotation.updateOne({reason: "Reason_2"}, {reason: "updated"});

        const res = await OutputLLM.findOne({reason: "updated"});
        expect(await Annotation.findOne({reason: "updated"})).not.toBeNull();
        expect(res.reason).toEqual("updated");
    });
});
