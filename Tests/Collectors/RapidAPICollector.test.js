const Collector = require("../../src/DataCollector/Collectors/RapidAPICollector");
const RapidAPIRequestSender = require("../../src/DataCollector/RequestSenders/RapidAPIRequestSender");
const JobPostHandler = require("../../src/DataCollector/Handlers/JobPostHandler");
const JobPostService = require("../../src/Services/JobPostService");
const RapidAPIConverter = require("../../src/DataCollector/Converters/RapidAPIConverter");
const ResultLogger = require("../../src/DataCollector/Loggers/ResultsLogger");

require("dotenv").config();

const response_example = {
    jobs: [
        {
            id: "UyxvLGYsdCx3LGEscixlLCAsRSxuLGcsaSxuLGUsZSxyLCwsICxKLHUsbixpLG8scixCLG8sbyx6LCA=",
            title: "Software Engineer, Junior",
            company: "Booz Allen Hamilton",
            description:
                "Software Engineer, Junior\n\nThe Opportunity:\n\nAs a back-end developer, you know that a good site or system needs the right combination of clean code, APIs, analytics, and infrastructure to develop a user-focused solution. We're looking for an experienced back-end developer with the software engineering skills it takes to identify potential risks, contribute to solution development, and create efficient and effective systems for our clients.\n\nAs a back-end developer at Booz Allen, you'll use the latest architectural approaches and open-source frameworks and tools to deliver solutions. Using your software engineering experience, you'll work with the development team to create custom tools, systems, and sites with consistent performance and scalability. In this role, you'll make a mission-forward impact as you further your skillset and career. Work with us as we shape systems for the better.\n\nJoin us. The world can't wait.\n\nYou Have:\n• Experience with programming languages, including... Java, Python, or C or C++\n• Knowledge of Object Oriented Programming (OOP) concepts\n• Ability to work with Linux or Windows\n• Ability to work in an Agile, team-based environment\n• Ability to obtain a security clearance\n• HS diploma or GED\n\nNice If You Have:\n• Experience with deploying software in a Cloud environment\n• Experience with frontend and backend development\n• Experience with Build Automation, DevOps, and DevSecOps\n• Experience with Software and System Architecture\n• Experience with physical or virtual networking\n• Experience with XML and JSON processing\n• Experience with image processing\n• Secret clearance\n• Bachelor's degree in a Science, Technology, Engineering, or Mathematics (STEM) field\n\nClearance:\n\nApplicants selected will be subject to a security investigation and may need to meet eligibility requirements for access to classified information.\n\nCreate Your Career:\n\nGrow With Us\n\nYour growth matters to us-that's why we offer a variety of ways for you to develop your career. With professional and leadership development opportunities like upskilling programs, tuition reimbursement, mentoring, and firm-sponsored networking, you can chart a unique and fulfilling career path on your own terms.\n\nA Place Where You Belong\n\nDiverse perspectives cultivate collective ingenuity. Booz Allen's culture of respect, equity, and opportunity means that, here, you are free to bring your whole self to work. With an array of business resource groups and other opportunities for connection, you'll develop your community in no time.\n\nSupport Your Well-Being\n\nOur comprehensive benefits package includes wellness programs with HSA contributions, paid holidays, paid parental leave, a generous 401(k) match, and more. With these benefits, plus the option for flexible schedules and remote and hybrid locations, we'll support you as you pursue a balanced, fulfilling life-at work and at home.\n\nYour Candidate Journey\n\nAt Booz Allen, we know our people are what propel us forward, and we value relationships most of all. Here, we've compiled a list of resources so you'll know what to expect as we forge a connection with you during your journey as a candidate with us.\n\nCompensation\n\nAt Booz Allen, we celebrate your contributions, provide you with opportunities and choices, and support your total well-being. Our offerings include health, life, disability, financial, and retirement benefits, as well as paid leave, professional development, tuition assistance, work-life programs, and dependent care. Our recognition awards program acknowledges employees for exceptional performance and superior demonstration of our values. Full-time and part-time employees working at least 20 hours a week on a regular basis are eligible to participate in Booz Allen's benefit programs. Individuals that do not meet the threshold are only eligible for select offerings, not inclusive of health benefits. We encourage you to learn more about our total benefits by visiting the Resource page on our Careers site and reviewing Our Employee Benefits page.\n\nSalary at Booz Allen is determined by various factors, including but not limited to location, the individual's particular combination of education, knowledge, skills, competencies, and experience, as well as contract-specific affordability and organizational requirements. The projected compensation range for this position is $51,600.00 to $105,000.00 (annualized USD). The estimate displayed represents the typical salary range for this position and is just one component of Booz Allen's total compensation package for employees. This posting will close within 90 days from the Posting Date.\n\nWork Model\n\nOur people-first culture prioritizes the benefits of flexibility and collaboration, whether that happens in person or remotely.\n• If this position is listed as remote or hybrid, you'll periodically work from a Booz Allen or client site facility.\n• If this position is listed as onsite, you'll work with colleagues and clients in person, as needed for the specific role.\n\nEEO Commitment\n\nWe're an equal employment opportunity/affirmative action employer that empowers our people to fearlessly drive change - no matter their race, color, ethnicity, religion, sex (including pregnancy, childbirth, lactation, or related medical conditions), national origin, ancestry, age, marital status, sexual orientation, gender identity and expression, disability, veteran status, military or uniformed service member status, genetic information, or any other status protected by applicable federal, state, local, or international law",
            image:
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0OK8VqK5Je_n-QComZ0V5AzZYHfqOTimnH6He&s=0",
            location: "Roma RM, Italia",
            employmentType: "Full-time e Part-time",
            datePosted: "2 giorni fa",
            salaryRange: "51.600–105.000 all'anno",
            jobProviders: [
                {
                    jobProvider: "Built In",
                    url: "https://builtin.com/job/software-engineer-junior/2456751?utm_campaign=google_jobs_apply&utm_source=google_jobs_apply&utm_medium=organic",
                },
            ],
        },
    ],
    index: 0,
    jobCount: 10,
    hasError: false,
    errors: [],
};
const response_example_2 = {
    jobs: [
        {
            id: "UyxvLGYsdCx3LGEscixlLCAsRSxuLGcsaSxuLGUsZSxyLCwsICxKLHUsbixpLG8scixCLG8sbyx6LCA=",
            title: "Software Engineer, Junior",
            company: "Booz Allen Hamilton",
            description:
                "Software Engineer, Junior\n\nThe Opportunity:\n\nAs a back-end developer, you know that a good site or system needs the right combination of clean code, APIs, analytics, and infrastructure to develop a user-focused solution. We're looking for an experienced back-end developer with the software engineering skills it takes to identify potential risks, contribute to solution development, and create efficient and effective systems for our clients.\n\nAs a back-end developer at Booz Allen, you'll use the latest architectural approaches and open-source frameworks and tools to deliver solutions. Using your software engineering experience, you'll work with the development team to create custom tools, systems, and sites with consistent performance and scalability. In this role, you'll make a mission-forward impact as you further your skillset and career. Work with us as we shape systems for the better.\n\nJoin us. The world can't wait.\n\nYou Have:\n• Experience with programming languages, including... Java, Python, or C or C++\n• Knowledge of Object Oriented Programming (OOP) concepts\n• Ability to work with Linux or Windows\n• Ability to work in an Agile, team-based environment\n• Ability to obtain a security clearance\n• HS diploma or GED\n\nNice If You Have:\n• Experience with deploying software in a Cloud environment\n• Experience with frontend and backend development\n• Experience with Build Automation, DevOps, and DevSecOps\n• Experience with Software and System Architecture\n• Experience with physical or virtual networking\n• Experience with XML and JSON processing\n• Experience with image processing\n• Secret clearance\n• Bachelor's degree in a Science, Technology, Engineering, or Mathematics (STEM) field\n\nClearance:\n\nApplicants selected will be subject to a security investigation and may need to meet eligibility requirements for access to classified information.\n\nCreate Your Career:\n\nGrow With Us\n\nYour growth matters to us-that's why we offer a variety of ways for you to develop your career. With professional and leadership development opportunities like upskilling programs, tuition reimbursement, mentoring, and firm-sponsored networking, you can chart a unique and fulfilling career path on your own terms.\n\nA Place Where You Belong\n\nDiverse perspectives cultivate collective ingenuity. Booz Allen's culture of respect, equity, and opportunity means that, here, you are free to bring your whole self to work. With an array of business resource groups and other opportunities for connection, you'll develop your community in no time.\n\nSupport Your Well-Being\n\nOur comprehensive benefits package includes wellness programs with HSA contributions, paid holidays, paid parental leave, a generous 401(k) match, and more. With these benefits, plus the option for flexible schedules and remote and hybrid locations, we'll support you as you pursue a balanced, fulfilling life-at work and at home.\n\nYour Candidate Journey\n\nAt Booz Allen, we know our people are what propel us forward, and we value relationships most of all. Here, we've compiled a list of resources so you'll know what to expect as we forge a connection with you during your journey as a candidate with us.\n\nCompensation\n\nAt Booz Allen, we celebrate your contributions, provide you with opportunities and choices, and support your total well-being. Our offerings include health, life, disability, financial, and retirement benefits, as well as paid leave, professional development, tuition assistance, work-life programs, and dependent care. Our recognition awards program acknowledges employees for exceptional performance and superior demonstration of our values. Full-time and part-time employees working at least 20 hours a week on a regular basis are eligible to participate in Booz Allen's benefit programs. Individuals that do not meet the threshold are only eligible for select offerings, not inclusive of health benefits. We encourage you to learn more about our total benefits by visiting the Resource page on our Careers site and reviewing Our Employee Benefits page.\n\nSalary at Booz Allen is determined by various factors, including but not limited to location, the individual's particular combination of education, knowledge, skills, competencies, and experience, as well as contract-specific affordability and organizational requirements. The projected compensation range for this position is $51,600.00 to $105,000.00 (annualized USD). The estimate displayed represents the typical salary range for this position and is just one component of Booz Allen's total compensation package for employees. This posting will close within 90 days from the Posting Date.\n\nWork Model\n\nOur people-first culture prioritizes the benefits of flexibility and collaboration, whether that happens in person or remotely.\n• If this position is listed as remote or hybrid, you'll periodically work from a Booz Allen or client site facility.\n• If this position is listed as onsite, you'll work with colleagues and clients in person, as needed for the specific role.\n\nEEO Commitment\n\nWe're an equal employment opportunity/affirmative action employer that empowers our people to fearlessly drive change - no matter their race, color, ethnicity, religion, sex (including pregnancy, childbirth, lactation, or related medical conditions), national origin, ancestry, age, marital status, sexual orientation, gender identity and expression, disability, veteran status, military or uniformed service member status, genetic information, or any other status protected by applicable federal, state, local, or international law",
            image:
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0OK8VqK5Je_n-QComZ0V5AzZYHfqOTimnH6He&s=0",
            location: "Roma RM, Italia",
            employmentType: "Full-time e Part-time",
            datePosted: "2 giorni fa",
            salaryRange: "51.600–105.000 all'anno",
            jobProviders: [
                {
                    jobProvider: "Built In",
                    url: "https://builtin.com/job/software-engineer-junior/2456751?utm_campaign=google_jobs_apply&utm_source=google_jobs_apply&utm_medium=organic",
                },
            ],
        },
        {
            id: "UyxvLGYsdCx3LGEscixlLCAsRSxuLGcsaSxuLGUsZSxyLFAscixvLGEsYyx0LGksdixlLCAsRyxsLG8=",
            title: "Software Engineer",
            company: "Proactive Global",
            description:
                "One of the world's largest providers of modular warehouse and logistics systems is looking for Software Engineer to join their team. It's a great opportunity to join company which has long-term vision strategy and values stability and sustainable growth.\n\nResponsibilities:\n• Developing software customisation based on provided technical specifications.\n• Testing the developed software to verify correct functionality and compliance with requested specifications.\n• Creating technical documentation for software operation.\n• Installing software remotely and/or at client sites.\n• Training user personnel from the client company.\n• Providing second-level assistance to clients after software installation.\n\nRequirements:\n• Software development for business process management (Knowledge of MICROSOFT .NET is a plus).\n• Relational databases (MS SQL SERVER / Oracle, even at a basic level).\n• Italian (native)\n• English language proficiency (B2 level).\n• Proficiency in the Microsoft Office... suite.\n\nReasons why you should apply:\n• Opportunity to join future-oriented workplace\n• Opportunity to develop state-of-the-art technologies\n• Familiar working environment\n• Attractive benefits\n\nHow to Apply:\n\nFor more information on the role, or an informal discussion regarding opportunities we have available, please contact Ligia Serwinowska: lserwinowska@proactiveglobal.com\n\nWhy work with Proactive?\n\nProactive Global is an industry leading, specialist engineering recruitment agency focused on the automation, manufacturing and robotics sectors. We offer specialist recruitment services to a niche customer base, vetting that our clients offer the best opportunities for your career. Proactive encourages and promotes equality and diversity within the workforce. We act with honesty, integrity and impartiality, ensuring your application is considered on its own merits and without bias.\n\nWhen registering with Proactive you will have the opportunity to apply for some of the most interesting, specialist, opportunities in the marketplace, with the biggest companies in the sector. Follow us on Linkedin and Facebook for industry news and download our app for live notifications about newly listed vacancies. We look forward to helping you find your next role!\n\nProactive Global is committed to equality in the workplace and is an equal opportunity employer.\nProactive Global is acting as an Employment Business in relation to this vacancy",
            image:
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5GNvy0q42BlpLL_FqP0OaIMDqHk-mjgnV6FKe&s=0",
            location: "Italia",
            employmentType: "Full-time",
            datePosted: "5 giorni fa",
            salaryRange: "",
            jobProviders: [
                {
                    jobProvider: "Proactive Global",
                    url: "https://www.proactiveglobal.com/job-search/25271-software-engineer/software-controls/italy/job?utm_campaign=google_jobs_apply&utm_source=google_jobs_apply&utm_medium=organic",
                },
                {
                    jobProvider: "Indeed",
                    url: "https://it.indeed.com/viewjob?jk=dec80eb83e840adf&utm_campaign=google_jobs_apply&utm_source=google_jobs_apply&utm_medium=organic",
                },
            ],
        },
    ],
    index: 10,
    jobCount: 5,
    hasError: false,
    errors: [],
};

describe("Collector: ", () => {
    beforeEach(() => jest.restoreAllMocks());

    it("search JobPost by type", async () => {
        const spyController = jest
            .spyOn(JobPostHandler.prototype, "insertListOfJobs")
            .mockImplementation(async () => Promise.resolve());

        const spyResultLogger = jest
            .spyOn(ResultLogger, "logResultsToJSONFile")
            .mockImplementation(async () => Promise.resolve());

        const mockedSender = new RapidAPIRequestSender();
        const controller = new JobPostHandler(RapidAPIConverter, JobPostService);
        const collector = new Collector(mockedSender, controller);

        const spySender = jest
            .spyOn(mockedSender, "sendRequest")
            .mockImplementation(async () => Promise.resolve(response_example));

        const job_type = "job_type";

        await collector.collect(job_type);

        expect(spySender).toHaveBeenCalled();
        expect(spyController).toHaveBeenCalled();
        expect(spyResultLogger).toHaveBeenCalled();
    });

    it("send 2 search requests", async () => {
        const spyController = jest
            .spyOn(JobPostHandler.prototype, "insertListOfJobs")
            .mockImplementation(async () => Promise.resolve());

        const spyResultLogger = jest
            .spyOn(ResultLogger, "logResultsToJSONFile")
            .mockImplementation(async () => Promise.resolve());

        const mockedSender = new RapidAPIRequestSender();
        const controller = new JobPostHandler(RapidAPIConverter, JobPostService);
        const collector = new Collector(mockedSender, controller);

        const spySender = jest
            .spyOn(mockedSender, "sendRequest")
            .mockImplementationOnce(() => response_example)
            .mockImplementationOnce(() => response_example_2);

        const job_type = "job_type";

        await collector.collect(job_type);

        expect(spySender).toHaveBeenCalledTimes(2);
        expect(spyController).toHaveBeenCalled();
        expect(spyResultLogger).toHaveBeenCalled();
    });

    it("send search requests until request limit reached", async () => {
        const spyController = jest
            .spyOn(JobPostHandler.prototype, "insertListOfJobs")
            .mockImplementation(async () => Promise.resolve());

        const spyResultLogger = jest
            .spyOn(ResultLogger, "logResultsToJSONFile")
            .mockImplementation(async () => Promise.resolve());

        const mockedSender = new RapidAPIRequestSender();
        const controller = new JobPostHandler(RapidAPIConverter, JobPostService);
        const collector = new Collector(mockedSender, controller);

        const spySender = jest
            .spyOn(mockedSender, "sendRequest")
            .mockImplementation(() => response_example);

        const job_type = "job_type";

        await collector.collect(job_type);

        const LIMIT = parseInt(process.env.REQUEST_LIMIT, 10);

        expect(spySender).toHaveBeenCalledTimes(LIMIT);
        expect(spyController).toHaveBeenCalled();
        expect(spyResultLogger).toHaveBeenCalledTimes(2);
    });
    it("search JobPost array of types", async () => {
        const sender = new RapidAPIRequestSender();
        const controller = new JobPostHandler(RapidAPIConverter, JobPostService);
        const collector = new Collector(sender, controller);

        const spySearch = jest
            .spyOn(Collector.prototype, "collect")
            .mockImplementation(async () => Promise.resolve());

        const job_types = ["job_type1", "job_type2"];

        await collector.collectList(job_types);

        expect(spySearch).toHaveBeenCalledTimes(2);
    });

    it("call jobpost controller", async () => {
        const sender = new RapidAPIRequestSender();
        const controller = new JobPostHandler(RapidAPIConverter, JobPostService);
        const collector = new Collector(sender, controller);

        const spyController = jest
            .spyOn(JobPostHandler.prototype, "insertListOfJobs")
            .mockImplementation(async () => Promise.resolve());

        const job_type = "job_type";
        const jobs = ["job1", "job2"];
        const language = "it-IT";

        await collector.insertJobs(jobs, job_type, language);

        expect(spyController).toHaveBeenCalledWith(jobs, job_type, language);
    });
});
