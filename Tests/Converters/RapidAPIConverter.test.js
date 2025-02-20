const RapidAPIConverter = require("../../Library/Converters/RapidAPIConverter");
const RapiAPIRequestSender = require("../../Library/RequestSenders/RapidAPIRequestSender");
const example_rapidapi_jobpost = {
    id: "QSxkLGQsZSx0LHQsbywgLEMsYSx0LGUscixpLG4sZywgLEEsZSxyLG8scCxvLHIsdCxvLCAsRixpLHU=",
    title: "Addetto Catering Aeroporto Fiumicino (697941)",
    company: "Manpower CORE Volume",
    description:
        "Manpower, per importante azienda leader nella fornitura di servizi catering, cerca:\n\nADDETTI ED ADDETTE AL CATERING AEREO\n\nLa figura richiesta dovrà occuparsi di:\n• predisposizione degli alimenti in conformità con le normative sanitarie e di sicurezza\n• caricamento dei pasti su appositi carrelli aerei\n• pulizia e lavaggio delle attrezzature e delle aree di lavoro\n• gestione degli inventari\n\nRequisiti:\n\nAutomuniti\n\nDisponibilità al lavoro su turni\n\nDisponibilità a lavorare nel weekend\n\nCapacità di lavorare in un ambiente dinamico e veloce\n\nOrario di lavoro: lavoro su 2 turni (6-14 e 14-22)\n\nLuogo di Lavoro: FIUMICINO (RM)\n\nTipo di contratto: previsto contratto di somministrazione FULL TIME a tempo determinato con possibilità di proroga\n\n\"Manpower e le altre Società di ManpowerGroup garantiscono (ai sensi del D.Lgs 198/2006, D.Lgs.215/2003 e D.Lgs.216/2003) pari opportunità di accesso al lavoro a tutt* i/le candidat* e sono impegnate nel favorire il rispetto delle diversità e... l'inclusione sul posto di lavoro. Il servizio è gratuito. I/Le candidat* sono invitati a leggere l'informativa Privacy disponibile su www.Manpower.it - Aut. Min. Prot. N. 1116 - SG - del 26/11/04. Il titolare della registrazione e/o candidatura dichiara di essere a conoscenza delle sanzioni penali previste in caso di dichiarazioni mendaci ai sensi e per gli effetti dell'art.46 del D.P.R. 445/2000\"\nby helplavoro.it",
    image: "",
    location: "Fiumicino RM, Italia",
    employmentType: "Full-time e Temporaneo",
    datePosted: "10 ore fa",
    salaryRange: "",
    jobProviders: [
        {
            jobProvider: "Indeed",
            url: "https://it.indeed.com/viewjob?jk=2031bf99cfc5cf64&utm_campaign=google_jobs_apply&utm_source=google_jobs_apply&utm_medium=organic",
        },
    ],
};

describe("RapidAPI Converter", () => {
    test("Creates a Job post from RapidAPI data", async () => {
        const converter = RapidAPIConverter.convert;
        const job_type = "Example Job Type";
        const icu_locale = "it-IT";
        const response = converter(example_rapidapi_jobpost, job_type, icu_locale);

        expect(response).not.toBe(undefined);

        expect(response.job_type).toEqual(job_type);
        expect(response.title).toEqual(example_rapidapi_jobpost.title);
        expect(response.company).toEqual(example_rapidapi_jobpost.company);
        expect(response.location).toEqual(example_rapidapi_jobpost.location);
        expect(response.employment_type).toEqual(
            example_rapidapi_jobpost.employmentType
        );
        expect(response.text).toEqual(example_rapidapi_jobpost.description);
        expect(response.icu_locale_language_tag).toEqual(icu_locale);
        expect(response.data_provider).toEqual("RapidAPI");

        expect(response.links.length).toBe(1);
        expect(response.links[0].source).toBe(
            example_rapidapi_jobpost.jobProviders[0].jobProvider
        );

        expect(response.author).toEqual(RapiAPIRequestSender.DATA_PROVIDER);
    });

    test("invalid job_type", () => {
        const converter = RapidAPIConverter.convert;
        const job_type = 123;
        const icu_locale = "it_IT";

        expect(() =>
            converter(example_rapidapi_jobpost, job_type, icu_locale)
        ).toThrow("job_type must be a string!");
    });

    test("invalid icu locale", () => {
        const converter = RapidAPIConverter.convert;
        const job_type = "Job type";
        const icu_locale = "it-en";

        expect(() =>
            converter(example_rapidapi_jobpost, job_type, icu_locale)
        ).toThrow("Invalid ICU locale tag: it-en");
    });
});
