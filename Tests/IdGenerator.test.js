const IdGenerator = require("../Library/IDGenerator");
const crypto = require("crypto");
const fs = require("fs/promises");

const job = {
    title: "Title",
    company: "Company    Name",
    location: "   LOCAtion   ",
};
const job_2 = {
    title: "Software Engineer, Junior",
    company: "e-work s.p.a.",
    location: "Roma RM, Italia",
};
const job_3 = {
    title: "   Software Engineer   Junior",
    company: "e-work s.p a",
    location: "Roma RM Italia",
};

describe("generate unique ID:", () => {
    it("should generate string from job containing title, company and location without spaces and all in lowercase", () => {
        const res = IdGenerator.jobToStringTitleCompanyLocation(job);
        const expectedString = "titlecompanynamelocation";
        expect(expectedString).toEqual(res);
    });
    it("should generate an id in base64", () => {
        const res = IdGenerator.generateJobPostID(job);
        const stringToHash = "titlecompanynamelocation";
        const expectedString = crypto
            .createHash("sha512")
            .update(stringToHash)
            .digest("base64");

        expect(expectedString).toEqual(res);
    });

    it("should throw an error", () => {
        expect(() =>
            IdGenerator.jobToStringTitleCompanyLocation({
                title: "Title",
                company: "Company    Name",
            })
        ).toThrow("Invalid JobPost!");

        expect(() =>
            IdGenerator.jobToStringTitleCompanyLocation({
                title: "Title",
                company: "Company    Name",
                location: 1234,
            })
        ).toThrow("Invalid JobPost!");
    });

    it("should remove special characters", () => {
        const res = IdGenerator.generateJobPostID(job_2);
        const expected = IdGenerator.generateJobPostID(job_3);

        expect(expected).toEqual(res);
    });

    it.skip("should process a list of job objs", async () => {
        const resString = await fs.readFile("./tests/duplicates.json", {
            encoding: "utf-8",
            flag: "r",
        });

        const jobs = JSON.parse(resString);

        const ids = new Set();

        for (const job of jobs) {
            const temp = IdGenerator.generateJobPostID(job);
            ids.add(temp);
        }

        expect(jobs.length).toEqual(ids.size);
    });
});
