const LabelService = require("../../src/Services/LabelService");
const AnnotationService = require("../../src/Services/AnnotationService");
const TransactionWrapper = require("../../src/Database/TransactionWrapper");
const {Label} = require("../../src/Models/Label");

describe("Label Service", () => {
    beforeEach(() => jest.restoreAllMocks());

    it("create a role", async () => {
        const spyLabel = jest
            .spyOn(Label, "create")
            .mockImplementation(async () => Promise.resolve());
        const spyExists = jest
            .spyOn(Label, "exists")
            .mockImplementation(async () => Promise.resolve());

        const label = "test-label";
        await LabelService.create(label);

        expect(spyLabel).toHaveBeenCalled();
        expect(spyExists).toHaveBeenCalled();
    });

    it("delete Label cascades deletes to Annotations with session", async () => {
        const spyLabel = jest
            .spyOn(Label, "deleteOne")
            .mockImplementation(async () => Promise.resolve());

        const spyAnnotation = jest
            .spyOn(AnnotationService, "deleteAnnotations")
            .mockImplementation(async () => Promise.resolve());

        const id = "id";
        const session = "session";
        await LabelService.deleteLabel(id, session);

        expect(spyLabel).toHaveBeenCalledWith({_id: id}, {session: session});
        expect(spyAnnotation).toHaveBeenCalledWith({label: id}, session);
    });

    it("delete Label cascades deletes to Annotations without session", async () => {
        const spyTransactionWrapper = jest
            .spyOn(TransactionWrapper, "transactionWrapper")
            .mockImplementation(async () => Promise.resolve());

        const id = "id";
        await LabelService.deleteLabel(id);

        expect(spyTransactionWrapper).toHaveBeenCalled();
    });

    it("get all labels", async () => {
        const spy = jest
            .spyOn(Label, "find")
            .mockImplementation(async () => Promise.resolve([1, 2, 3]));

        const res = await LabelService.getAll();

        expect(res.length).toBe(3);

        expect(spy).toHaveBeenCalled();
    });

    it("get label", async () => {
        const label = "label";
        const spy = jest
            .spyOn(Label, "findById")
            .mockImplementation(async () => Promise.resolve({label: label}));

        const id = "label id";
        const res = await LabelService.getLabel(id);

        expect(spy).toHaveBeenCalledWith(id);
        expect(res).toEqual(label);
    });
});
