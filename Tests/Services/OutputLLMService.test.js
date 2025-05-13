const OutputLLMService = require("../../src/Services/OutputLLMService");
const OutputLLM = require("../../src/Models/OutputLLM");

describe("OutputLLM Service:", () => {
    beforeEach(() => jest.restoreAllMocks());

    it("get all outputllm records", async () => {
        const spy = jest
            .spyOn(OutputLLM, "find")
            .mockImplementation(async () => Promise.resolve([1, 2, 3]));

        const res = await OutputLLMService.getAll();

        expect(res.length).toBe(3);

        expect(spy).toHaveBeenCalled();
    });
});
