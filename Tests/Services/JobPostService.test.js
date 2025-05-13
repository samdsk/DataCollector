const JobPostService = require("../../src/Services/JobPostService");
const AnnotationService = require("../../src/Services/AnnotationService");
const {JobPost} = require("../../src/Models/JobPost");
const {Text} = require("../../src/Models/Text");
const DataProviderService = require("../../src/Services/DataProviderService");
const TransactionWrapper = require("../../src/Database/TransactionWrapper");

const opts = {runValidators: true};

describe("JobPost Service:", () => {
    beforeEach(() => jest.restoreAllMocks());
    it("create jobpost", async () => {
        const spy = jest
            .spyOn(JobPost, "create")
            .mockImplementation(async () => Promise.resolve("Test obj"));
        jest
            .spyOn(JobPost, "findById")
            .mockImplementation(async () => Promise.resolve(false));

        const spyDataProvider = jest
            .spyOn(DataProviderService, "getIDByName")
            .mockImplementation(async () => Promise.resolve("MockedID"));

        const spyExists = jest
            .spyOn(JobPost, "exists")
            .mockImplementation(async () => Promise.resolve());

        const jobpost = {
            title: "title",
            company: "company",
            location: "location",
            data_provider: "DataProvider",
        };

        await JobPostService.create(jobpost);

        expect(spy).toHaveBeenCalled();
        expect(spyDataProvider).toHaveBeenCalled();
    });

    it("jobpost update job_type", async () => {
        const spy = jest
            .spyOn(JobPost, "updateOne")
            .mockImplementation(async () => Promise.resolve());

        const id = "id";
        const job_type = "job_type";
        await JobPostService.updateJobType(id, job_type);

        expect(spy).toHaveBeenCalledWith({_id: id}, {job_type: job_type}, opts);
    });
    it("jobpost update title", async () => {
        const spy = jest
            .spyOn(Text, "updateOne")
            .mockImplementation(async () => Promise.resolve());

        const id = "id";
        const title = "title";
        await JobPostService.updateTitle(id, title);

        expect(spy).toHaveBeenCalledWith({_id: id}, {title: title}, opts);
    });
    it("jobpost update company", async () => {
        const spy = jest
            .spyOn(JobPost, "updateOne")
            .mockImplementation(async () => Promise.resolve());

        const id = "id";
        const company = "company";
        await JobPostService.updateCompany(id, company);

        expect(spy).toHaveBeenCalledWith({_id: id}, {company: company}, opts);
    });
    it("jobpost update location", async () => {
        const spy = jest
            .spyOn(JobPost, "updateOne")
            .mockImplementation(async () => Promise.resolve());

        const id = "id";
        const location = "location";
        await JobPostService.updateLocation(id, location);

        expect(spy).toHaveBeenCalledWith({_id: id}, {location: location}, opts);
    });
    it("jobpost update employment_type", async () => {
        const spy = jest
            .spyOn(JobPost, "updateOne")
            .mockImplementation(async () => Promise.resolve());

        const id = "id";
        const employment_type = "employment_type";
        await JobPostService.updateEmploymentType(id, employment_type);

        expect(spy).toHaveBeenCalledWith(
            {_id: id},
            {employment_type: employment_type},
            opts
        );
    });
    it("jobpost update text", async () => {
        const spy = jest
            .spyOn(Text, "updateOne")
            .mockImplementation(async () => Promise.resolve());

        const id = "id";
        const text = "text";
        await JobPostService.updateTextField(id, text);

        expect(spy).toHaveBeenCalledWith({_id: id}, {text: text}, opts);
    });
    it("jobpost update links", async () => {
        const spy = jest
            .spyOn(Text, "updateOne")
            .mockImplementation(async () => Promise.resolve());

        const id = "id";
        const links = "links";
        await JobPostService.updateLinks(id, links);

        expect(spy).toHaveBeenCalledWith({_id: id}, {links: links}, opts);
    });
    it("jobpost add link", async () => {
        const spy = jest
            .spyOn(Text, "updateOne")
            .mockImplementation(async () => Promise.resolve());

        const id = "id";
        const link = "link";
        await JobPostService.addLink(id, link);

        expect(spy).toHaveBeenCalledWith(
            {_id: id},
            {$push: {links: link}},
            opts
        );
    });
    it("jobpost remove link by source", async () => {
        const spy = jest
            .spyOn(Text, "updateOne")
            .mockImplementation(async () => Promise.resolve());

        const id = "id";
        const link_source = "link source";
        await JobPostService.removeLinkBySource(id, link_source);

        expect(spy).toHaveBeenCalledWith(
            {_id: id},
            {$pull: {links: {source: link_source}}},
            opts
        );
    });
    it("jobpost remove link by url", async () => {
        const spy = jest
            .spyOn(Text, "updateOne")
            .mockImplementation(async () => Promise.resolve());

        const id = "id";
        const link_url = "link_url";
        await JobPostService.removeLinkByURL(id, link_url);

        expect(spy).toHaveBeenCalledWith(
            {_id: id},
            {$pull: {links: {url: link_url}}},
            opts
        );
    });

    it("delete jobpost with session", async () => {
        const spyJobPost = jest
            .spyOn(Text, "deleteOne")
            .mockImplementation(async () => Promise.resolve());

        const spyAnnotationService = jest
            .spyOn(AnnotationService, "deleteAnnotations")
            .mockImplementation(async () => Promise.resolve());

        const id = "id";
        const session = "session";

        await JobPostService.deleteOne(id, session);

        expect(spyJobPost).toHaveBeenCalledWith({_id: id}, {session: session});
        expect(spyAnnotationService).toHaveBeenCalledWith({text: id}, session);
    });

    it("delete jobpost without session", async () => {
        const spyTransactionWrapper = jest
            .spyOn(TransactionWrapper, "transactionWrapper")
            .mockImplementation(async () => Promise.resolve());

        const id = "id";

        await JobPostService.deleteOne(id);

        expect(spyTransactionWrapper).toHaveBeenCalled();
    });

    it("get all job posts", async () => {
        const spy = jest
            .spyOn(JobPost, "find")
            .mockImplementation(() => Promise.resolve([1, 2, 3]));

        const res = await JobPostService.getAll();

        expect(res.length).toBe(3);

        expect(spy).toHaveBeenCalled();
    });

    it("get all job posts by job type", async () => {
        const spy = jest
            .spyOn(JobPost, "find")
            .mockImplementation(() => Promise.resolve());

        const job_type = "job type";

        await JobPostService.getByJobType(job_type);

        expect(spy).toHaveBeenCalledWith({job_type: job_type});
    });

    it("get all job posts by company", async () => {
        const spy = jest
            .spyOn(JobPost, "find")
            .mockImplementation(() => Promise.resolve());

        const company = "company";

        await JobPostService.getByCompany(company);

        expect(spy).toHaveBeenCalledWith({company: company});
    });
    it("get all job posts by location", async () => {
        const spy = jest
            .spyOn(JobPost, "find")
            .mockImplementation(() => Promise.resolve());

        const location = "location";

        await JobPostService.getByLocation(location);

        expect(spy).toHaveBeenCalledWith({location: location});
    });
    it("get all job posts by employment type", async () => {
        const spy = jest
            .spyOn(JobPost, "find")
            .mockImplementation(() => Promise.resolve());

        const employment_type = "employment type";

        await JobPostService.getByEmploymentType(employment_type);

        expect(spy).toHaveBeenCalledWith({employment_type: employment_type});
    });

    it("get job type", async () => {
        const job_type = "job_type";
        const spy = jest
            .spyOn(JobPost, "findById")
            .mockImplementation(async () => Promise.resolve({job_type: job_type}));

        const id = "jobpost id";
        const res = await JobPostService.getJobType(id, job_type);

        expect(spy).toHaveBeenCalledWith(id, job_type);
        expect(res).toEqual(job_type);
    });
    it("get title", async () => {
        const title = "title";
        const spy = jest
            .spyOn(Text, "findById")
            .mockImplementation(async () => Promise.resolve({title: title}));

        const id = "jobpost id";
        const res = await JobPostService.getTitle(id);

        expect(spy).toHaveBeenCalledWith(id);
        expect(res).toEqual(title);
    });
    it("get company", async () => {
        const company = "company";
        const spy = jest
            .spyOn(JobPost, "findById")
            .mockImplementation(async () => Promise.resolve({company: company}));

        const id = "jobpost id";
        const res = await JobPostService.getCompany(id);

        expect(spy).toHaveBeenCalledWith(id, company);
        expect(res).toEqual(company);
    });
    it("get location", async () => {
        const location = "location";
        const spy = jest
            .spyOn(JobPost, "findById")
            .mockImplementation(async () => Promise.resolve({location: location}));

        const id = "jobpost id";
        const res = await JobPostService.getLocation(id);

        expect(spy).toHaveBeenCalledWith(id, "location");
        expect(res).toEqual(location);
    });
    it("get employment type", async () => {
        const employment_type = "employment type";
        const spy = jest
            .spyOn(JobPost, "findById")
            .mockImplementation(async () =>
                Promise.resolve({employment_type: employment_type})
            );

        const id = "jobpost id";
        const res = await JobPostService.getEmploymentType(id);

        expect(spy).toHaveBeenCalledWith(id, "employment_type");
        expect(res).toEqual(employment_type);
    });
    it("get text", async () => {
        const text = "text";
        const spy = jest
            .spyOn(Text, "findById")
            .mockImplementation(async () => Promise.resolve({text: text}));

        const id = "jobpost id";
        const res = await JobPostService.getTextField(id);

        expect(spy).toHaveBeenCalledWith(id);
        expect(res).toEqual(text);
    });
    it("get links", async () => {
        const links = [{source: "source", url: "url"}];
        const spy = jest
            .spyOn(Text, "findById")
            .mockImplementation(async () => Promise.resolve({links: links}));

        const id = "jobpost id";
        const res = await JobPostService.getLinks(id);

        expect(spy).toHaveBeenCalledWith(id);
        expect(res).toEqual(links);
    });
    it("get link by source", async () => {
        const source = "source";
        const url = "url";
        const links = [{source: source, url: url}];
        const spy = jest
            .spyOn(Text, "findById")
            .mockImplementation(async () => Promise.resolve({links: links}));

        const id = "jobpost id";

        const res = await JobPostService.getLinkBySource(id, source);

        expect(spy).toHaveBeenCalledWith(id);
        expect(res).toEqual(url);
    });

    it("get all text", async () => {
        const text = [
            {text: "description1"},
            {text: "description2"},
            {text: "description3"},
        ];
        const spy = jest
            .spyOn(JobPost, "find")
            .mockImplementation(async () => Promise.resolve(text));

        const res = await JobPostService.getAllTexts();

        expect(spy).toHaveBeenCalled();
        expect(res.length).toEqual(text.length);
        expect(res[2]).toEqual(text[2].text);
    });
});
