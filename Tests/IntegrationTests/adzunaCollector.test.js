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
    "mean": 56641.73,
    "results": [
        {
            "id": "5345357427",
            "title": "Software Engineer",
            "description": "Ciao Network!  Sono alla ricerca attiva di un SENIOR FULL STACK, freelance da inserire su un nostro cliente finale in ambito Healthcare in Italia. Lingua Parlata nel progetto Italiano. MUST! Skills tecniche richieste: -BACK END: Node.js possibilmente con Nest.js -FRONT END: Vue.js o React.js con TypeScript -DATABASE utilizzati: MongoDB, PostgreSQL -Metodologia di lavoro \u00e8 Agile/Scrum, si lavora ad obbiettivi. Andrai a lavorare in un team di persone altamente qualificate. La persona ideale \u00e8 un \u2026",
            "adref": "eyJhbGciOiJIUzI1NiJ9.eyJzIjoiTXFkMXRqaDE4Qkdaai1IdGc1SFZuUSIsImkiOiI1MzQ1MzU3NDI3In0._PLUun0tOGYaQKC9DQRP6ZoLCgdor0rNl8LilElHEoQ",
            "company": {
                "__CLASS__": "Adzuna::API::Response::Company",
                "display_name": "Tenth Revolution Group"
            },
            "location": {
                "__CLASS__": "Adzuna::API::Response::Location",
                "display_name": "Italia",
                "area": ["Italia"]
            },
            "__CLASS__": "Adzuna::API::Response::Job",
            "redirect_url": "https://www.adzuna.it/land/ad/5345357427?se=Mqd1tjh18BGZj-Htg5HVnQ&utm_medium=api&utm_source=03484920&v=14149A09DB3CAFD9D8A8496C71E3F7813057BC7F",
            "category": {
                "tag": "unknown",
                "label": "Unknown",
                "__CLASS__": "Adzuna::API::Response::Category"
            },
            "created": "2025-08-09T13:54:44Z",
            "salary_is_predicted": "0"
        },
        {
            "adref": "eyJhbGciOiJIUzI1NiJ9.eyJpIjoiNTM0MzYxNDI4MiIsInMiOiJNcWQxdGpoMThCR1pqLUh0ZzVIVm5RIn0.CJXKm0DrJBh74NyrLCXqCJpiMKLr52kckf4ssY2yZq0",
            "company": {
                "__CLASS__": "Adzuna::API::Response::Company",
                "display_name": "Edison Smart\u00ae"
            },
            "location": {
                "display_name": "Italia",
                "__CLASS__": "Adzuna::API::Response::Location",
                "area": ["Italia"]
            },
            "id": "5343614282",
            "title": "Software Engineer",
            "description": "Software Engineer | Milan (Remote) | Up to \u20ac70,000 Join a growing IoT company, who build solutions that help protect data and connectivity for IoT devices around the world. As a Software Engineer, you will join a R&D team to help develop a scalable and secure solution to support IoT Devices. This is a remote position; however, you will need to be available for occasional office visits to Milan. Skills/Technology Python and/or Golang AWS (or other cloud platform) SQL Agile Automated Testing",
            "category": {
                "label": "Customer Service/Call Center",
                "tag": "customer-services-jobs",
                "__CLASS__": "Adzuna::API::Response::Category"
            },
            "created": "2025-08-08T13:44:25Z",
            "salary_is_predicted": "0",
            "__CLASS__": "Adzuna::API::Response::Job",
            "redirect_url": "https://www.adzuna.it/land/ad/5343614282?se=Mqd1tjh18BGZj-Htg5HVnQ&utm_medium=api&utm_source=03484920&v=A3FD981492229106C425A28C18B083FA9E085AB2"
        },
        {
            "id": "5260908066",
            "title": "Software Engineer",
            "description": "Fai la differenza con AYES: unisciti come SOFTWARE ENGINEER! AYES, multinazionale di consulenza ingegneristica e tecnologica, in vista dell'espansione delle proprie attivit\u00e0 in Italia e all'estero, \u00e8 alla ricerca di un SOFTWARE ENGINEER . AYES opera a livello globale, offrendo soluzioni avanzate e progetti innovativi nei settori pi\u00f9 affermati dell'industria: Automotive, Aerospazio e Difesa, Ferroviario, Energia, Oil & Gas, Life Sciences e Telecomunicazioni. Con sedi in Italia, Europa e Stati Un\u2026",
            "adref": "eyJhbGciOiJIUzI1NiJ9.eyJzIjoiTXFkMXRqaDE4Qkdaai1IdGc1SFZuUSIsImkiOiI1MjYwOTA4MDY2In0.h4GI1O1BAZ2Fsdx7hwjMZAzZUowBkCH1o2TBRq9hxfg",
            "company": {
                "display_name": "AYES - Management & Technology Consulting",
                "__CLASS__": "Adzuna::API::Response::Company"
            },
            "location": {
                "area": ["Italia"],
                "display_name": "Italia",
                "__CLASS__": "Adzuna::API::Response::Location"
            },
            "__CLASS__": "Adzuna::API::Response::Job",
            "redirect_url": "https://www.adzuna.it/land/ad/5260908066?se=Mqd1tjh18BGZj-Htg5HVnQ&utm_medium=api&utm_source=03484920&v=4D6244C57BA85576328801F07ED71AFB1E055802",
            "category": {
                "label": "Unknown",
                "tag": "unknown",
                "__CLASS__": "Adzuna::API::Response::Category"
            },
            "created": "2025-06-21T04:53:03Z",
            "salary_is_predicted": "0"
        }
    ],
    "count": 1847,
    "__CLASS__": "Adzuna::API::Response::JobSearchResults"
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

        expect((await JobPostService.getAll()).length).toBe(3);
    });
});
