const Collector = require("../../src/DataCollector/Collectors/AdzunaCollector.js");
const {connect, close, clearDatabase} = require("../db_handler");
const AdzunaRequestSender = require("../../src/DataCollector/RequestSenders/AdzunaRequestSender");
const AdzunaConverter = require("../../src/DataCollector/Converters/AdzunaConverter");
const JobPostService = require("../../src/Services/JobPostService.js");
const JobPostHandler = require("../../src/DataCollector/Handlers/JobPostHandler");
const DataProviderService = require("../../src/Services/DataProviderService.js");
const axios = require("axios");

require("dotenv").config();

const delete_list = ["texts"];

const response_example = {
    mean: 56641.73,
    results: [
        {
            id: "5345357427",
            title: "Software Engineer",
            description: "Ciao Network!  Sono alla ricerca attiva di un SENIOR FULL STACK, freelance da inserire su un nostro cliente finale in ambito Healthcare in Italia. Lingua Parlata nel progetto Italiano. MUST! Skills tecniche richieste: -BACK END: Node.js possibilmente con Nest.js -FRONT END: Vue.js o React.js con TypeScript -DATABASE utilizzati: MongoDB, PostgreSQL -Metodologia di lavoro \u00e8 Agile/Scrum, si lavora ad obbiettivi. Andrai a lavorare in un team di persone altamente qualificate. La persona ideale \u00e8 un \u2026",
            adref: "eyJhbGciOiJIUzI1NiJ9.eyJzIjoiTXFkMXRqaDE4Qkdaai1IdGc1SFZuUSIsImkiOiI1MzQ1MzU3NDI3In0._PLUun0tOGYaQKC9DQRP6ZoLCgdor0rNl8LilElHEoQ",
            company: {
                display_name: "Tenth Revolution Group"
            },
            location: {
                display_name: "Italia",
                area: ["Italia"]
            },
            redirect_url: "https://www.adzuna.it/land/ad/5345357427?se=Mqd1tjh18BGZj-Htg5HVnQ&utm_medium=api&utm_source=03484920&v=14149A09DB3CAFD9D8A8496C71E3F7813057BC7F",
            category: {
                tag: "unknown",
                label: "Unknown",
            },
            created: "2025-08-09T13:54:44Z",
            salary_is_predicted: "0"
        }
    ],
    count: 0,
};

jest.mock("axios");

describe("Collector Integration Test:", () => {
    beforeAll(async () => {
        await connect();
        await DataProviderService.create(AdzunaRequestSender.DATA_PROVIDER);
    });

    afterAll(async () => {
        await close();
    });

    afterEach(async () => {
        await clearDatabase(delete_list);
    });

    it("Collect job", async () => {
        const jobType = "Software Engineer";
        const language = "it_IT";
        const response_example_1 = {
            ...response_example,
            language: language,
            job_type: jobType,
            count:0,
        };

        const requestSender = new AdzunaRequestSender();
        const controller = new JobPostHandler(AdzunaConverter, JobPostService);
        const collector = new Collector(requestSender, controller);

        axios.get.mockResolvedValue({
            data: response_example_1,
        });

        jest
            .spyOn(collector, "logFullResponse")
            .mockImplementation(async () => Promise.resolve());
        jest
            .spyOn(collector, "logResults")
            .mockImplementation(async () => Promise.resolve());

        const job_type = "JobType";

        const response = await collector.collect(job_type);

        expect((await JobPostService.getAll()).length).toBe(1);
    });
});
