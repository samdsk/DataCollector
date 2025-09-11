// Automator.test.js
const Automator = require("../../src/DataCollector/Automators/JSearchAutomator");
const MaxRetriesReachedError = require("../../src/DataCollector/Errors/MaxRetriesReachedError");

describe('Automator', () => {
    let senderMock, collectorMock, retryHandlerMock, config;

    beforeEach(() => {
        senderMock = {
            setApiKey: jest.fn(),
        };

        collectorMock = {
            collect: jest.fn(),
        };

        retryHandlerMock = {
            setExcludedErrorCodes: jest.fn(),
            execute: jest.fn((fn, context) => fn()),
        };

        config = {
            delayBetweenRequests: 0,
        };
    });

    test('should throw an error if keys are not a Set', () => {
        expect(() => new Automator([], senderMock, collectorMock, retryHandlerMock, config))
            .toThrow('Automator: keys must be a set');
    });

    test('should initialize retryHandler with excluded error codes', () => {
        new Automator(new Set(['key1']), senderMock, collectorMock, retryHandlerMock, config);
        expect(retryHandlerMock.setExcludedErrorCodes).toHaveBeenCalledWith(Automator.KEY_DELETE_ERROR_CODES);
    });

    test('should call collectWithKey on automate', async () => {
        const keys = new Set(['key1']);
        const jobTypesList = ['jobType1'];
        const options = {};

        const automator = new Automator(keys, senderMock, collectorMock, retryHandlerMock, config);
        const collectWithKeySpy = jest.spyOn(automator, 'collectWithKey').mockResolvedValue(['result1']);

        const result = await automator.automate(jobTypesList, options);

        expect(senderMock.setApiKey).toHaveBeenCalledWith('key1');
        expect(collectWithKeySpy).toHaveBeenCalledWith('key1', jobTypesList, options);
        expect(result).toEqual(['result1']);
    });

    test('should handle MaxRetriesReachedError in automate', async () => {
        const keys = new Set(['key1']);
        const jobTypesList = ['jobType1'];
        const options = {};

        const automator = new Automator(keys, senderMock, collectorMock, retryHandlerMock, config);
        jest.spyOn(automator, 'collectWithKey').mockRejectedValue(new MaxRetriesReachedError());

        await expect(automator.automate(jobTypesList, options))
            .rejects.toThrow(MaxRetriesReachedError);
    });

    test('should handle and remove invalid keys in automate', async () => {
        const keys = new Set(['key1']);
        const jobTypesList = ['jobType1'];
        const options = {};
        const error = {status: 401, jobType: 'jobType1', requestedPage: 1};

        const automator = new Automator(keys, senderMock, collectorMock, retryHandlerMock, config);
        jest.spyOn(automator, 'collectWithKey').mockRejectedValue(error);
        const handleCollectErrorSpy = jest.spyOn(automator, 'handleCollectError');

        await automator.automate(jobTypesList, options);

        expect(handleCollectErrorSpy).toHaveBeenCalledWith(error, jobTypesList, options, 'key1');
        expect(keys.has('key1')).toBe(false);
    });

    test('should correctly paginate with updatePaginationState', () => {
        const jobTypesList = ['jobType1', 'jobType2'];
        const options = {requestedPage: 3};
        const error = {jobType: 'jobType1', requestedPage: 2, availableItems: 5};

        const automator = new Automator(new Set(['key1']), senderMock, collectorMock, retryHandlerMock, config);
        automator.updatePaginationState(error, jobTypesList, options);

        expect(options.requestedPage).toBe(1);
        expect(jobTypesList).toEqual(['jobType1', 'jobType2']);
    });
});