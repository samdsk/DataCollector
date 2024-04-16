const {
  logResultsToJSONFile,
  RES_DIR,
  getPathCompatibleStringFromDate,
} = require("../lib/resultsLogger");
const fs = require("fs").promises;

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

describe("Custom JSON logger", () => {
  const filename = "test_filename";
  const date = new Date(Date.now());
  const timeStamp = getPathCompatibleStringFromDate(date);
  const fullPath = `${RES_DIR}${filename}_${timeStamp}.json`;

  afterAll(async () => {
    try {
      await fs.access(fullPath);
      await fs.rm(fullPath);
    } catch (error) {
      console.log(eroor);
    }
  });
  it("should create file in results directory", async () => {
    await logResultsToJSONFile(filename, date, response_example);

    const responseString = await fs.readFile(fullPath, {
      encoding: "utf8",
      flag: "r",
    });

    const response = JSON.parse(responseString);

    expect(response.jobs[0].id).toBe(response_example.jobs[0].id);
  });
});
