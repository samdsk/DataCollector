const Collector = require("../../src/DataCollector/Collectors/JSearchCollector.js");
const {connect, close, clearDatabase} = require("../db_handler");
const RequestSender = require("../../src/DataCollector/RequestSenders/JSearchRequestSender");
const Converter = require("../../src/DataCollector/Converters/JSearchConverter");
const JobPostService = require("../../src/Services/JobPostService.js");
const JobPostHandler = require("../../src/DataCollector/Handlers/JobPostHandler");
const DataProviderService = require("../../src/Services/DataProviderService.js");
const axios = require("axios");

require("dotenv").config();

const delete_list = ["texts"];

const response_example = {

    "status": "OK",
    "request_id": "09938a4c-318a-4a79-9be2-d051e9f79c69",
    "parameters": {
        "query": "Software Engineer",
        "page": 1,
        "num_pages": 2,
        "date_posted": "month",
        "country": "it",
        "language": "it"
    },
    "data": [
        {
            "job_id": "GR05eWisOz88AYczAAAAAA==",
            "job_title": "Ingegnere di Sistema",
            "employer_name": "Randstad Enterprise Italia",
            "employer_logo": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR0a93fJuadDuOrNizDEiwYWicFMTYGVy0noAoo&s=0",
            "employer_website": "http://www.randstad.com/",
            "job_publisher": "LinkedIn",
            "job_employment_type": "Full-time",
            "job_employment_types": ["FULLTIME"],
            "job_apply_link": "https://it.linkedin.com/jobs/view/ingegnere-di-sistema-at-randstad-enterprise-italia-4297602159?utm_campaign=google_jobs_apply&utm_source=google_jobs_apply&utm_medium=organic",
            "job_apply_is_direct": false,
            "apply_options": [
                {
                    "publisher": "LinkedIn",
                    "apply_link": "https://it.linkedin.com/jobs/view/ingegnere-di-sistema-at-randstad-enterprise-italia-4297602159?utm_campaign=google_jobs_apply&utm_source=google_jobs_apply&utm_medium=organic",
                    "is_direct": false
                },
                {
                    "publisher": "SimplyHired",
                    "apply_link": "https://www.simplyhired.it/job/9O6_JsifQlaMg_I6l52lC7d8H5TTF13KiJW5UNAVyhQ7T0KbzQWCwA?utm_campaign=google_jobs_apply&utm_source=google_jobs_apply&utm_medium=organic",
                    "is_direct": false
                },
                {
                    "publisher": "Sercanto",
                    "apply_link": "https://www.sercanto.it/detail/a/ingegnere-di-sistema_la-spezia_301753082?utm_campaign=google_jobs_apply&utm_source=google_jobs_apply&utm_medium=organic",
                    "is_direct": false
                },
                {
                    "publisher": "Lavoro Trabajo.org",
                    "apply_link": "https://it.trabajo.org/offerta-3025-15c0cd9697deefd4341f80a89b6af0e7?utm_campaign=google_jobs_apply&utm_source=google_jobs_apply&utm_medium=organic",
                    "is_direct": false
                }
            ],
            "job_description": "🚀 Ingegnere di Sistema\n\n📍 La Spezia\n\n📅 Assunzione diretta a tempo indeterminato.\n\nRandstad Enterprise Italia, per conto di un’azienda leader nel settore Difesa e Tecnologie Avanzate, è alla ricerca di un*Ingegnere di Sistema, una ruolo chiave per l'analisi dei requisiti, studi architetturali, design, sviluppo e verifica di ambienti complessi di simulazione.\n\nAttività previste per il ruolo:\n• Analisi dei requisiti, studi architetturali, design, sviluppo e verifica di ambienti complessi di simulazione e simulatori comportamentali di sistemi e/o sotto-sistemi d’arma;\n• Supporto al cliente interno ed esterno nell’utilizzo dei tool di simulazione lungo l’intero ciclo di vita del prodotto;\n• Utilizzo di metodologie di Synthetic Environment\n• Uso di strumenti di Realtà Aumentata e Virtuale per miglioramento delle visualizzazioni e supporto al training;\n• Realizzazione di simulazioni del sistema e dei suoi componenti a supporto di studi progettuali e di validazione;\n• Definizione di strategie e piani di verifica e validazione e raccolta evidenze;\n• Partecipazione a gruppi di lavoro inter-disciplinari (anche internazionali) ed attività di ricerca;\n• Integrazione e test in laboratorio e sul campo di sistemi d’arma e dei loro componenti;\n• Partecipazione a progetti di rilevanza internazionale in ambito difesa.\n\nPROFILO PROFESSIONALE\n• Laurea magistrale in discipline tecnico/scientifiche, preferibilmente nella famiglia dell’Ingegneria dell’Informazione e dell’Informatica\n• Esperienza didattica o lavorativa nello sviluppo software (titolo preferenziale)\n• Attività pratica svolta in laboratori, tirocini o tramite progetti personali\n• Conoscenza dei linguaggi di programmazione, con preferenza per C e C++\n• Familiarità con protocolli e standard di comunicazione (Ethernet, ISO-OSI, TCP, UDP, ecc.)\n• Competenze in programmazione orientata agli oggetti (OOP)\n• Conoscenza delle basi di progettazione architetturale di sistemi complessi:\n• Identificazione delle funzioni di sistema e allocazione ai sottosistemi\n• Modellazione di stati e modalità operative\n• Definizione di interfacce e dimensionamento degli apparati\n• Stesura dei requisiti di sistema e dei sottosistemi\n• Gradita conoscenza di framework grafici (Qt, framework C#, Unity, Unreal Engine)\n\nSOFT SKILLS\n• Buona conoscenza della lingua inglese, scritta e parlata\n• Attitudine al lavoro di squadra, anche in contesti internazionali\n• Capacità di analisi, sintesi e comunicazione scritta\n• Autonomia nell’organizzazione del lavoro e orientamento al risultato\n\n🎓 Se sogni di mettere le tue competenze al servizio di tecnologie d’avanguardia e contribuire a progetti strategici per la sicurezza del futuro… questo è il momento di partire\n\n- -\n\nLa ricerca è rivolta ai candidati ambosessi (L.903/77). Ti preghiamo di leggere l'informativa sulla privacy Randstad (https://www.randstad.it/privacy/) ai sensi dell'art. 13 del Regolamento (UE) 2016/679 sulla protezione dei dati (GDPR).",
            "job_is_remote": false,
            "job_posted_at": "1 giorno fa",
            "job_posted_at_timestamp": null,
            "job_posted_at_datetime_utc": null,
            "job_location": "La Spezia SP",
            "job_city": "La Spezia",
            "job_state": "Provincia della Spezia",
            "job_country": "IT",
            "job_latitude": 44.102450399999995,
            "job_longitude": 9.824082599999999,
            "job_benefits": null,
            "job_google_link": "https://www.google.com/search?q=jobs&gl=it&hl=it&udm=8#vhid=vt%3D20/docid%3DGR05eWisOz88AYczAAAAAA%3D%3D&vssid=jobs-detail-viewer",
            "job_salary": null,
            "job_min_salary": null,
            "job_max_salary": null,
            "job_salary_period": null,
            "job_highlights": {},
            "job_onet_soc": "15113300",
            "job_onet_job_zone": "4"
        },
        {
            "job_id": "VYHWx2x4s-28MXtUAAAAAA==",
            "job_title": "Platform Software Engineer",
            "employer_name": "Vertiv",
            "employer_logo": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwky7VSzxfdJsq6mkGbpqavlGhe-FAqQ6ZLKDM&s=0",
            "employer_website": "http://www.vertiv.com/",
            "job_publisher": "LinkedIn",
            "job_employment_type": "Full-time",
            "job_employment_types": ["FULLTIME"],
            "job_apply_link": "https://it.linkedin.com/jobs/view/platform-software-engineer-at-vertiv-4297609340?utm_campaign=google_jobs_apply&utm_source=google_jobs_apply&utm_medium=organic",
            "job_apply_is_direct": false,
            "apply_options": [
                {
                    "publisher": "LinkedIn",
                    "apply_link": "https://it.linkedin.com/jobs/view/platform-software-engineer-at-vertiv-4297609340?utm_campaign=google_jobs_apply&utm_source=google_jobs_apply&utm_medium=organic",
                    "is_direct": false
                },
                {
                    "publisher": "Oracle Cloud Infrastructure (OCI)",
                    "apply_link": "https://egup.fa.us2.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX/job/20257483?utm_campaign=google_jobs_apply&utm_source=google_jobs_apply&utm_medium=organic",
                    "is_direct": false
                },
                {
                    "publisher": "BeBee",
                    "apply_link": "https://it.bebee.com/job/a1055084d3619e28a4eaf089ce6c275d?utm_campaign=google_jobs_apply&utm_source=google_jobs_apply&utm_medium=organic",
                    "is_direct": false
                }
            ],
            "job_description": "Job Description\n\nAt Vertiv, we’re on a mission to empower the people that will power the future. From a simple swipe to life-changing medicines, from push notifications to generative AI. We design, manufacture, and service the products and solutions that keep the world connected. With $6.9 billion in sales, a strong customer base and global reach spanning nearly 70 countries, we are uniquely positioned to deliver greater value to our customers and create new opportunities for our people.\n\nWe are seeking a motivated and technically skilled Platform Software Engineer to join our R&D team in Tognana, Italy!\n\nAs Platform Software Engineer you will contribute to the development, integration, and testing of the core software platform powering our industrial control systems.This platform is designed to manage distributed embedded units used in critical thermal systems and infrastructure environments, enabling high-resolution data acquisition, real-time diagnostics, and robust multi-device communication through industrial protocols. You will play a key role in shaping a modular, scalable, and future-ready software foundation.\n\nWhat kind of work will you be doing?\n• Design and implement software components in C/C++, and Python\n• Develop services and infrastructure on Linux-based embedded platforms\n• Implement and maintain communication layers using protocols such as Modbus RTU/TCP, CANbus, MQTT, and other fieldbus systems\n• Write and maintain automation and deployment tools using Bash and Python\n• Contribute to the definition of the software architecture and apply design patterns for scalability and maintainability\n• Ensure the robustness and performance of the system through debugging, profiling, and optimization\n• Produce and maintain high-quality technical documentation, including module specifications, interface definitions, and integration guidelines\n• Collaborate closely with cross-functional teams (firmware, hardware, cloud, QA and tech service) throughout the development lifecycle\n• Design, maintain, and improve CI/CD pipelines using tools such as GitLab CI/CD to ensure efficient build, test, and deployment workflows\n• Contribute to the creation and management of containerized environments using Docker, supporting consistent development and deployment across systems\n\nWhat will make you successful?\n• Degree in a STEM field, such as Computer Science, Electronic Engineering, Physics, or Automation\n• Strong programming skills in C/C++ and Python\n• Solid understanding of Linux operating systems and Bash scripting. (kernel knowledge nice to have)\n• Experience with industrial protocols such as:\n• Modbus RTU / TCP\n• CANbus/CANopen\n• MQTT\n• Good knowledge of software engineering principles, version control, and design patterns\n• Demonstrated attention to detail, structured thinking, and commitment to high-quality results\n• Fluent in English, both spoken and written\n\nIf YOU are the person we are looking for, feel free to apply and let's start drafting your future career in a healthy and growing environment!\n\nThe successful candidate will embrace Vertiv’s Core Principals & Behaviors to help execute our Strategic Priorities.\n\nOUR CORE PRINCIPALS: Safety. Integrity. Respect. Teamwork. Diversity & Inclusion.\n\nOUR STRATEGIC PRIORITIES\n• Customer Focus\n• Operational Excellence\n• High-Performance Culture\n• Innovation\n• Financial Strength\n\nOUR BEHAVIORS\n• Own It\n• Act With Urgency\n• Foster a Customer-First Mindset\n• Think Big and Execute\n• Lead by Example\n• Drive Continuous Improvement\n• Learn and Seek Out Development\n\nAbout The Team\n\nWork Authorization\n\nNo calls or agencies please. Vertiv will only employ those who are legally authorized to work in the United States. This is not a position for which sponsorship will be provided. Individuals with temporary visas such as E, F-1, H-1, H-2, L, B, J, or TN or who need sponsorship for work authorization now or in the future, are not eligible for hire.\n\nEqual Opportunity Employer\n\nWe promote equal opportunities for all with respect to hiring, terms of employment, mobility, training, compensation, and occupational health, without discrimination as to age, race, color, religion, creed, sex, pregnancy status (including childbirth, breastfeeding, or related medical conditions), marital status, sexual orientation, gender identity / expression (including transgender status or sexual stereotypes), genetic information, citizenship status, national origin, protected veteran status, political affiliation, or disability.",
            "job_is_remote": false,
            "job_posted_at": "1 giorno fa",
            "job_posted_at_timestamp": null,
            "job_posted_at_datetime_utc": null,
            "job_location": "Piove di Sacco PD",
            "job_city": "Piove di Sacco",
            "job_state": "Provincia di Padova",
            "job_country": "IT",
            "job_latitude": 45.2970404,
            "job_longitude": 12.0349421,
            "job_benefits": null,
            "job_google_link": "https://www.google.com/search?q=jobs&gl=it&hl=it&udm=8#vhid=vt%3D20/docid%3DVYHWx2x4s-28MXtUAAAAAA%3D%3D&vssid=jobs-detail-viewer",
            "job_salary": null,
            "job_min_salary": null,
            "job_max_salary": null,
            "job_salary_period": null,
            "job_highlights": {},
            "job_onet_soc": "15113200",
            "job_onet_job_zone": "4"
        }
    ],
    "location": "it",
    "language": "it_IT",
    "job_type": "Software Engineer",
    "data_provider": "JSearch"
};

jest.mock("axios");

describe("Collector Integration Test:", () => {
    beforeAll(async () => {
        await connect();
        await DataProviderService.create(RequestSender.DATA_PROVIDER);
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
            count: 0,
        };

        const requestSender = new RequestSender();
        const controller = new JobPostHandler(Converter, JobPostService);
        const collector = new Collector(requestSender, controller);

        axios.request.mockResolvedValue({
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

        expect((await JobPostService.getAll()).length).toBe(2);
    });
});
