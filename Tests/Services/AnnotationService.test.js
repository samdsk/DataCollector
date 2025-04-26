const AnnotationService = require("../../Services/AnnotationService");
const TransactionWrapper = require("../../Database/TransactionWrapper");
const {Annotation} = require("../../Models/Annotation");

const {connect, close} = require("../db_handler");

const opts = {runValidators: true};

describe("Annotation Service", () => {
    beforeAll(async () => {
        await connect();
    });

    afterAll(async () => {
        await close();
    });

    beforeEach(() => jest.restoreAllMocks());

    it("creates annotation", async () => {
        const spy = jest
            .spyOn(Annotation, "create")
            .mockImplementation(async () => Promise.resolve());

        const annotator = {
            role: "role.id",
            background: "background.id",
        };

        await AnnotationService.create(annotator);

        expect(spy).toHaveBeenCalled();
    });

    it("annotator update text", async () => {
        const spy = jest
            .spyOn(Annotation, "updateOne")
            .mockImplementation(async () => Promise.resolve());

        const id = "id";
        const text = "text";
        await AnnotationService.updateText(id, text);

        expect(spy).toHaveBeenCalledWith({_id: id}, {text: text}, opts);
    });
    it("annotator update annotator", async () => {
        const spy = jest
            .spyOn(Annotation, "updateOne")
            .mockImplementation(async () => Promise.resolve());

        const id = "id";
        const annotator = "annotator";
        await AnnotationService.updateAnnotator(id, annotator);

        expect(spy).toHaveBeenCalledWith(
            {_id: id},
            {annotator: annotator},
            opts
        );
    });
    it("annotator update label", async () => {
        const spy = jest
            .spyOn(Annotation, "updateOne")
            .mockImplementation(async () => Promise.resolve());

        const id = "id";
        const label = "label";
        await AnnotationService.updateLabel(id, label);

        expect(spy).toHaveBeenCalledWith({_id: id}, {label: label}, opts);
    });
    it("annotator update reason", async () => {
        const spy = jest
            .spyOn(Annotation, "updateOne")
            .mockImplementation(async () => Promise.resolve());

        const id = "id";
        const reason = "reason";
        await AnnotationService.updateReason(id, reason);

        expect(spy).toHaveBeenCalledWith({_id: id}, {reason: reason}, opts);
    });
    it("annotator update domain", async () => {
        const spy = jest
            .spyOn(Annotation, "updateOne")
            .mockImplementation(async () => Promise.resolve());

        const id = "id";
        const domain = "domain";
        await AnnotationService.updateDomain(id, domain);

        expect(spy).toHaveBeenCalledWith({_id: id}, {domain: domain}, opts);
    });
    it("annotator add token", async () => {
        const spy = jest
            .spyOn(Annotation, "updateOne")
            .mockImplementation(async () => Promise.resolve());

        const id = "id";
        const token = "token";
        await AnnotationService.addToken(id, token);

        expect(spy).toHaveBeenCalledWith(
            {_id: id},
            {$push: {tokens: token}},
            opts
        );
    });
    it("annotator remove token", async () => {
        const spy = jest
            .spyOn(Annotation, "updateOne")
            .mockImplementation(async () => Promise.resolve());

        const id = "id";
        const token = "token";
        await AnnotationService.deleteToken(id, token);

        expect(spy).toHaveBeenCalledWith(
            {_id: id},
            {$pull: {tokens: token}},
            opts
        );
    });
    it("annotator update tokens", async () => {
        const spy = jest
            .spyOn(Annotation, "updateOne")
            .mockImplementation(async () => Promise.resolve());

        const id = "id";
        const tokens = "tokens";
        await AnnotationService.updateTokens(id, tokens);

        expect(spy).toHaveBeenCalledWith({_id: id}, {tokens: tokens}, opts);
    });

    it("delete an Annotation with session", async () => {
        const spy = jest
            .spyOn(Annotation, "deleteOne")
            .mockImplementation(async () => Promise.resolve());

        const id = "id";
        const session = "session";

        await AnnotationService.deleteAnnotation(id, session);

        expect(spy).toHaveBeenCalledWith({_id: id}, {session: session});
    });
    it("delete an Annotation without session", async () => {
        const spy = jest
            .spyOn(TransactionWrapper, "transactionWrapper")
            .mockImplementation(async () => Promise.resolve());

        const id = "id";

        await AnnotationService.deleteAnnotation(id);

        expect(spy).toHaveBeenCalled();
    });

    it("delete an Annotations with session", async () => {
        const spy = jest
            .spyOn(Annotation, "deleteMany")
            .mockImplementation(async () => Promise.resolve());

        const filter = {};
        const session = "session";

        await AnnotationService.deleteAnnotations(filter, session);

        expect(spy).toHaveBeenCalledWith(filter, {session: session});
    });
    it("delete an Annotation without session", async () => {
        const spy = jest
            .spyOn(TransactionWrapper, "transactionWrapper")
            .mockImplementation(async () => Promise.resolve());

        const filter = {};

        await AnnotationService.deleteAnnotations(filter);

        expect(spy).toHaveBeenCalled();
    });

    it("get all annotations", async () => {
        const spy = jest
            .spyOn(Annotation, "find")
            .mockImplementation(() => Promise.resolve([1, 2, 3]));

        const res = await AnnotationService.getAll();

        expect(res.length).toBe(3);

        expect(spy).toHaveBeenCalled();
    });

    it("get all annotations by annotator", async () => {
        const spy = jest
            .spyOn(Annotation, "find")
            .mockImplementation(() => Promise.resolve());

        const annotator = "annotator id";

        await AnnotationService.getAnnotationsByAnnotator(annotator);

        expect(spy).toHaveBeenCalledWith({annotator: annotator});
    });
    it("get all annotations by text", async () => {
        const spy = jest
            .spyOn(Annotation, "find")
            .mockImplementation(() => Promise.resolve());

        const text = "text id";

        await AnnotationService.getAnnotationsByText(text);

        expect(spy).toHaveBeenCalledWith({text: text});
    });
    it("get all annotations by label", async () => {
        const spy = jest
            .spyOn(Annotation, "find")
            .mockImplementation(() => Promise.resolve());

        const label = "label id";

        await AnnotationService.getAnnotationsByLabel(label);

        expect(spy).toHaveBeenCalledWith({label: label});
    });
    it("get all annotations by domain", async () => {
        const spy = jest
            .spyOn(Annotation, "find")
            .mockImplementation(() => Promise.resolve());

        const domain = "domain id";

        await AnnotationService.getAnnotationsByDomain(domain);

        expect(spy).toHaveBeenCalledWith({domain: domain});
    });

    it("get text", async () => {
        const text = "text";
        const spy = jest
            .spyOn(Annotation, "findById")
            .mockImplementation(async () => Promise.resolve({text: text}));

        const id = "annotation id";
        const res = await AnnotationService.getText(id);

        expect(spy).toHaveBeenCalledWith(id);
        expect(res).toEqual(text);
    });
    it("get tokens", async () => {
        const tokens = ["token1", "token2"];
        const spy = jest
            .spyOn(Annotation, "findById")
            .mockImplementation(async () => Promise.resolve({tokens: tokens}));

        const id = "annotation id";
        const res = await AnnotationService.getTokens(id);

        expect(spy).toHaveBeenCalledWith(id);
        expect(res).toEqual(tokens);
    });
    it("get domain", async () => {
        const domain = "domain";
        const spy = jest
            .spyOn(Annotation, "findById")
            .mockImplementation(async () => Promise.resolve({domain: domain}));

        const id = "annotation id";
        const res = await AnnotationService.getDomain(id);

        expect(spy).toHaveBeenCalledWith(id);
        expect(res).toEqual(domain);
    });
    it("get reason", async () => {
        const reason = "reason";
        const spy = jest
            .spyOn(Annotation, "findById")
            .mockImplementation(async () => Promise.resolve({reason: reason}));

        const id = "annotation id";
        const res = await AnnotationService.getReason(id);

        expect(spy).toHaveBeenCalledWith(id);
        expect(res).toEqual(reason);
    });
    it("get annotator", async () => {
        const annotator = "annotator";
        const spy = jest
            .spyOn(Annotation, "findById")
            .mockImplementation(async () =>
                Promise.resolve({annotator: annotator})
            );

        const id = "annotation id";
        const res = await AnnotationService.getAnnotator(id);

        expect(spy).toHaveBeenCalledWith(id);
        expect(res).toEqual(annotator);
    });
});
