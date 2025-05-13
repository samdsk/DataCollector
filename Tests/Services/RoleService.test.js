const RoleService = require("../../src/Services/RoleService");
const AnnotatorService = require("../../src/Services/AnnotatorService");
const TransactionWrapper = require("../../src/Database/TransactionWrapper");
const {Role} = require("../../src/Models/Role");

const opts = {runValidators: true};

describe("Role Service", () => {
    beforeEach(() => jest.restoreAllMocks());

    it("create a role", async () => {
        const spyRole = jest
            .spyOn(Role, "create")
            .mockImplementation(async () => Promise.resolve());

        const spyExists = jest
            .spyOn(Role, "exists")
            .mockImplementation(async () => Promise.resolve());

        const role = {};
        await RoleService.create(role);

        expect(spyExists).toHaveBeenCalled();
        expect(spyRole).toHaveBeenCalled();
    });

    it("update Reliability score", async () => {
        const spyRole = jest
            .spyOn(Role, "updateOne")
            .mockImplementation(async () => Promise.resolve());

        const id = "id";
        const score = 56;

        await RoleService.updateReliabilityScore(id, score);

        expect(spyRole).toHaveBeenCalled();
        expect(spyRole).toHaveBeenCalledWith(
            {_id: id},
            {reliability_score: score},
            opts
        );
    });

    it("delete Role cascades deletes to Annotators with session", async () => {
        const spyRole = jest
            .spyOn(Role, "deleteOne")
            .mockImplementation(async () => Promise.resolve());

        const spyAnnotator = jest
            .spyOn(AnnotatorService, "deleteAnnotators")
            .mockImplementation(async () => Promise.resolve());

        const id = "id";
        const session = "session";
        await RoleService.deleteRole(id, session);

        expect(spyRole).toHaveBeenCalledWith({_id: id}, {session: session});
        expect(spyAnnotator).toHaveBeenCalledWith({role: id}, session);
    });

    it("delete Role cascades deletes to Annotators without session", async () => {
        const spyTransactionWrapper = jest
            .spyOn(TransactionWrapper, "transactionWrapper")
            .mockImplementation(async () => Promise.resolve());

        const id = "id";
        await RoleService.deleteRole(id);

        expect(spyTransactionWrapper).toHaveBeenCalled();
    });

    it("get all roles", async () => {
        const spy = jest
            .spyOn(Role, "find")
            .mockImplementation(async () => Promise.resolve([1, 2, 3]));

        const res = await RoleService.getAll();

        expect(res.length).toBe(3);

        expect(spy).toHaveBeenCalled();
    });
    it("get all roles by reliability score", async () => {
        const spy = jest
            .spyOn(Role, "find")
            .mockImplementation(async () => Promise.resolve());

        const score = 5;
        await RoleService.getRolesByReliabilityScore(score);

        expect(spy).toHaveBeenCalledWith({reliability_score: score});
    });

    it("get role", async () => {
        const role = "role";
        const spy = jest
            .spyOn(Role, "findById")
            .mockImplementation(async () => Promise.resolve({role: role}));

        const id = "role id";
        const res = await RoleService.getRole(id);

        expect(spy).toHaveBeenCalledWith(id);
        expect(res).toEqual(role);
    });

    it("get reliability score", async () => {
        const score = 5;
        const spy = jest
            .spyOn(Role, "findById")
            .mockImplementation(async () =>
                Promise.resolve({reliability_score: score})
            );

        const id = "role id";
        const res = await RoleService.getReliabilityScore(id);

        expect(spy).toHaveBeenCalledWith(id);
        expect(res).toEqual(score);
    });
});
