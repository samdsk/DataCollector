const TransferData = require("../src/Database/TransferData");

describe("Transfer Data", () => {
    it.skip("Convert Old JobPosts to Text JobPosts", async () => {
        const {total, inserted} = await TransferData.convertOldJobPostToText(
            "mongodb://localhost:27017/test_transfer",
            "rapidapi",
            "it-IT"
        );

        expect(total).toEqual(inserted);
    });
});
