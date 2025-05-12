const DomainService = require("../../src/Services/DomainService");
const AnnotationService = require("../../src/Services/AnnotationService");
const TransactionWrapper = require("../../src/Database/TransactionWrapper");
const {Domain} = require("../../src/Models/Domain");

describe("Domain Service", () => {
    beforeEach(() => jest.restoreAllMocks());

    it("create a domain", async () => {
        const spyLabel = jest
            .spyOn(Domain, "create")
            .mockImplementation(async () => Promise.resolve());
        const spyExists = jest
            .spyOn(Domain, "exists")
            .mockImplementation(async () => Promise.resolve());

        const domain = "test-domain";
        await DomainService.create(domain);

        expect(spyLabel).toHaveBeenCalled();
    });

    it("delete Domain cascades deletes to Annotations with session", async () => {
        const spyLabel = jest
            .spyOn(Domain, "deleteOne")
            .mockImplementation(async () => Promise.resolve());

        const spyAnnotation = jest
            .spyOn(AnnotationService, "deleteAnnotations")
            .mockImplementation(async () => Promise.resolve());

        const id = "id";
        const session = "session";
        await DomainService.deleteDomain(id, session);

        expect(spyLabel).toHaveBeenCalledWith({_id: id}, {session: session});
        expect(spyAnnotation).toHaveBeenCalledWith({domain: id}, session);
    });

    it("delete Domain cascades deletes to Annotations without session", async () => {
        const spyTransactionWrapper = jest
            .spyOn(TransactionWrapper, "transactionWrapper")
            .mockImplementation(async () => Promise.resolve());

        const id = "id";
        await DomainService.deleteDomain(id);

        expect(spyTransactionWrapper).toHaveBeenCalled();
    });

    it("get all domains", async () => {
        const spy = jest
            .spyOn(Domain, "find")
            .mockImplementation(async () => Promise.resolve([1, 2, 3]));

        const res = await DomainService.getAll();

        expect(res.length).toBe(3);

        expect(spy).toHaveBeenCalled();
    });

    it("get domain", async () => {
        const domain = "domain";
        const spy = jest
            .spyOn(Domain, "findById")
            .mockImplementation(async () => Promise.resolve({domain: domain}));

        const id = "domain id";
        const res = await DomainService.getDomain(id);

        expect(spy).toHaveBeenCalledWith(id);
        expect(res).toEqual(domain);
    });
});
