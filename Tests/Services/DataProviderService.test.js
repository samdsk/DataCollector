const DataProviderService = require("../../src/Services/DataProviderService");
const {DataProvider} = require("../../src/Models/DataProvider");

describe("DataProvider Service", () => {
    beforeEach(() => jest.restoreAllMocks());

    it("create a data provider", async () => {
        const spyCreate = jest
            .spyOn(DataProvider, "create")
            .mockImplementation(async () => Promise.resolve());

        const spyExists = jest
            .spyOn(DataProvider, "exists")
            .mockImplementation(async () => Promise.resolve());

        const data_provider = "RapidAPI";
        await DataProviderService.create(data_provider);

        expect(spyExists).toHaveBeenCalled();
        expect(spyCreate).toHaveBeenCalled();
    });
    it("invalid data provider", async () => {
        const data_provider = 123;

        await expect(DataProviderService.create(data_provider)).rejects.toThrow(
            "Validation Error - Model: DataProvider, Field: data_provider, Message: must be a string"
        );
    });

    it("get data providers id from name", async () => {
        const mockedDataProviderID = "mocked id";
        const spyRole = jest.spyOn(DataProvider, "findOne").mockReturnValue({
            select: async () => Promise.resolve({_id: mockedDataProviderID}),
        });

        const data_provider = "RapidAPI";
        const result = await DataProviderService.getIDByName(data_provider);

        expect(spyRole).toHaveBeenCalled();
        expect(result).toEqual(mockedDataProviderID);
    });
});
