const BackgroundService = require("../../src/Services/BackgroundService");
const AnnotatorService = require("../../src/Services/AnnotatorService");
const TransactionWrapper = require("../../src/Database/TransactionWrapper");
const {Background} = require("../../src/Models/Background");

describe("Background Service", () => {
    beforeEach(() => jest.restoreAllMocks());

    it("create a background", async () => {
        const spyCreate = jest
            .spyOn(Background, "create")
            .mockImplementation(async () => Promise.resolve());
        const spyExists = jest
            .spyOn(Background, "exists")
            .mockImplementation(async () => Promise.resolve());

        const background = "test-background";
        await BackgroundService.create(background);

        expect(spyExists).toHaveBeenCalled();
        expect(spyCreate).toHaveBeenCalled();
    });

    it("delete Background cascades deletes to Annotators with session", async () => {
        const spyBackground = jest
            .spyOn(Background, "deleteOne")
            .mockImplementation(async () => Promise.resolve());

        const spyAnnotator = jest
            .spyOn(AnnotatorService, "deleteAnnotators")
            .mockImplementation(async () => Promise.resolve());

        const id = "id";
        const session = "session";
        await BackgroundService.deleteBackground(id, session);

        expect(spyBackground).toHaveBeenCalledWith(
            {_id: id},
            {session: session}
        );
        expect(spyAnnotator).toHaveBeenCalledWith({background: id}, session);
    });

    it("delete Background cascades deletes to Annotators without session", async () => {
        const spyTransactionWrapper = jest
            .spyOn(TransactionWrapper, "transactionWrapper")
            .mockImplementation(async () => Promise.resolve());

        const id = "id";
        await BackgroundService.deleteBackground(id);

        expect(spyTransactionWrapper).toHaveBeenCalled();
    });

    it("get all backgrounds", async () => {
        const spy = jest
            .spyOn(Background, "find")
            .mockImplementation(async () => Promise.resolve([1, 2, 3]));

        const res = await BackgroundService.getAll();

        expect(res.length).toBe(3);

        expect(spy).toHaveBeenCalled();
    });

    it("get background", async () => {
        const background = "background";
        const spy = jest
            .spyOn(Background, "findById")
            .mockImplementation(async () =>
                Promise.resolve({background: background})
            );

        const id = "background id";
        const res = await BackgroundService.getBackground(id);

        expect(spy).toHaveBeenCalledWith(id);
        expect(res).toEqual(background);
    });
});
