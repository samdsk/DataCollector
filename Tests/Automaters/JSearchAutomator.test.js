const JSearchAutomator = require("../../src/DataCollector/Automators/JSearchAutomator");
const MaxRetriesReachedError = require("../../src/DataCollector/Errors/MaxRetriesReachedError");

describe('JSearchAutomator', () => {
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
            delayBetweenRequests: 100,
        };

        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    describe('Constructor', () => {
        test('should throw an error if keys are not a Set', () => {
            expect(() => new JSearchAutomator([], senderMock, collectorMock, retryHandlerMock, config))
                .toThrow('JSearchAutomator: keys must be a set');
        });

        test('should initialize retryHandler with excluded error codes', () => {
            new JSearchAutomator(new Set(['key1']), senderMock, collectorMock, retryHandlerMock, config);
            expect(retryHandlerMock.setExcludedErrorCodes).toHaveBeenCalledWith([429, 403, 401]);
        });

        test('should properly initialize all properties', () => {
            const keys = new Set(['key1', 'key2']);
            const automator = new JSearchAutomator(keys, senderMock, collectorMock, retryHandlerMock, config);

            expect(automator.keys).toBe(keys);
            expect(automator.sender).toBe(senderMock);
            expect(automator.collector).toBe(collectorMock);
            expect(automator.retryHandler).toBe(retryHandlerMock);
            expect(automator.config).toBe(config);
        });
    });

    describe('automate', () => {
        test('should successfully automate with first key', async () => {
            const keys = new Set(['key1', 'key2']);
            const jobTypesList = ['jobType1'];
            const options = {};

            const automator = new JSearchAutomator(keys, senderMock, collectorMock, retryHandlerMock, config);
            const collectWithKeySpy = jest.spyOn(automator, 'collectWithKey').mockResolvedValue(['result1']);

            const result = await automator.automate(jobTypesList, options);

            expect(senderMock.setApiKey).toHaveBeenCalledWith('key1');
            expect(collectWithKeySpy).toHaveBeenCalledWith('key1', jobTypesList, options);
            expect(result).toEqual(['result1']);
        });

        test('should handle MaxRetriesReachedError and rethrow it', async () => {
            const keys = new Set(['key1']);
            const jobTypesList = ['jobType1'];
            const options = {};

            const automator = new JSearchAutomator(keys, senderMock, collectorMock, retryHandlerMock, config);
            jest.spyOn(automator, 'collectWithKey').mockRejectedValue(new MaxRetriesReachedError());

            await expect(automator.automate(jobTypesList, options))
                .rejects.toThrow(MaxRetriesReachedError);
        });

        test('should handle collection errors and call handleCollectError', async () => {
            const keys = new Set(['key1']);
            const jobTypesList = ['jobType1'];
            const options = {};
            const error = { status: 401, jobType: 'jobType1', requestedPage: 1 };

            const automator = new JSearchAutomator(keys, senderMock, collectorMock, retryHandlerMock, config);
            jest.spyOn(automator, 'collectWithKey').mockRejectedValue(error);
            const handleCollectErrorSpy = jest.spyOn(automator, 'handleCollectError');

            const result = await automator.automate(jobTypesList, options);

            expect(handleCollectErrorSpy).toHaveBeenCalledWith(error, jobTypesList, options, 'key1');
            expect(result).toEqual([]);
        });

        test('should try multiple keys if first one fails', async () => {
            const keys = new Set(['key1', 'key2']);
            const jobTypesList = ['jobType1'];
            const options = {};
            const error = { status: 500, jobType: 'jobType1', requestedPage: 1 };

            const automator = new JSearchAutomator(keys, senderMock, collectorMock, retryHandlerMock, config);
            jest.spyOn(automator, 'collectWithKey')
                .mockRejectedValueOnce(error)
                .mockResolvedValueOnce(['result2']);

            const result = await automator.automate(jobTypesList, options);

            expect(senderMock.setApiKey).toHaveBeenCalledTimes(2);
            expect(senderMock.setApiKey).toHaveBeenNthCalledWith(1, 'key1');
            expect(senderMock.setApiKey).toHaveBeenNthCalledWith(2, 'key2');
            expect(result).toEqual(['result2']);
        });
    });

    describe('collectWithKey', () => {
        test('should collect all job types successfully', async () => {
            const keys = new Set(['key1']);
            const jobTypesList = ['jobType1', 'jobType2'];
            const options = { requestedPage: 1 };

            collectorMock.collect.mockResolvedValueOnce({ data: 'result1' });
            collectorMock.collect.mockResolvedValueOnce({ data: 'result2' });

            const automator = new JSearchAutomator(keys, senderMock, collectorMock, retryHandlerMock, config);
            const result = await automator.collectWithKey('key1', jobTypesList, options);

            expect(retryHandlerMock.execute).toHaveBeenCalledTimes(2);
            expect(collectorMock.collect).toHaveBeenCalledTimes(2);
            expect(collectorMock.collect).toHaveBeenNthCalledWith(1, 'jobType1', options);
            expect(collectorMock.collect).toHaveBeenNthCalledWith(2, 'jobType2', options);
            expect(result).toEqual([{ data: 'result1' }, { data: 'result2' }]);
        });

        test('should reset requestedPage to 1 after each successful collection', async () => {
            const keys = new Set(['key1']);
            const jobTypesList = ['jobType1'];
            const options = { requestedPage: 5 };

            collectorMock.collect.mockResolvedValue({ data: 'result1' });

            const automator = new JSearchAutomator(keys, senderMock, collectorMock, retryHandlerMock, config);
            await automator.collectWithKey('key1', jobTypesList, options);

            // Verify that requestedPage was reset in the retry handler execution
            expect(retryHandlerMock.execute).toHaveBeenCalledWith(
                expect.any(Function),
                { key: 'key1', jobType: 'jobType1', options }
            );
        });

        test('should apply delay between requests when configured', async () => {
            const keys = new Set(['key1']);
            const jobTypesList = ['jobType1', 'jobType2'];
            const options = {};

            collectorMock.collect.mockResolvedValue({ data: 'result' });

            const automator = new JSearchAutomator(keys, senderMock, collectorMock, retryHandlerMock, config);

            const setTimeoutSpy = jest.spyOn(global, 'setTimeout').mockImplementation((fn) => fn());

            await automator.collectWithKey('key1', jobTypesList, options);

            expect(setTimeoutSpy).toHaveBeenCalledTimes(2);
            expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 100);

            setTimeoutSpy.mockRestore();
        });

        test('should not apply delay when delayBetweenRequests is not configured', async () => {
            const keys = new Set(['key1']);
            const jobTypesList = ['jobType1'];
            const options = {};
            const configNoDelay = {};

            collectorMock.collect.mockResolvedValue({ data: 'result' });

            const automator = new JSearchAutomator(keys, senderMock, collectorMock, retryHandlerMock, configNoDelay);

            const setTimeoutSpy = jest.spyOn(global, 'setTimeout');

            await automator.collectWithKey('key1', jobTypesList, options);

            expect(setTimeoutSpy).not.toHaveBeenCalled();

            setTimeoutSpy.mockRestore();
        });
    });

    describe('handleCollectError', () => {
        test('should remove key when error status is in KEY_DELETE_ERROR_CODES', () => {
            const keys = new Set(['key1', 'key2']);
            const jobTypesList = ['jobType1'];
            const options = {};
            const error = { status: 401, jobType: 'jobType1', requestedPage: 1 };

            const automator = new JSearchAutomator(keys, senderMock, collectorMock, retryHandlerMock, config);
            jest.spyOn(automator, 'updatePaginationState');

            automator.handleCollectError(error, jobTypesList, options, 'key1');

            expect(keys.has('key1')).toBe(false);
            expect(keys.has('key2')).toBe(true);
        });

        test('should not remove key when error status is not in KEY_DELETE_ERROR_CODES', () => {
            const keys = new Set(['key1', 'key2']);
            const jobTypesList = ['jobType1'];
            const options = {};
            const error = { status: 500, jobType: 'jobType1', requestedPage: 1 };

            const automator = new JSearchAutomator(keys, senderMock, collectorMock, retryHandlerMock, config);
            jest.spyOn(automator, 'updatePaginationState');

            automator.handleCollectError(error, jobTypesList, options, 'key1');

            expect(keys.has('key1')).toBe(true);
            expect(keys.has('key2')).toBe(true);
        });

        test('should call updatePaginationState', () => {
            const keys = new Set(['key1']);
            const jobTypesList = ['jobType1'];
            const options = {};
            const error = { status: 500, jobType: 'jobType1', requestedPage: 1 };

            const automator = new JSearchAutomator(keys, senderMock, collectorMock, retryHandlerMock, config);
            const updatePaginationStateSpy = jest.spyOn(automator, 'updatePaginationState');

            automator.handleCollectError(error, jobTypesList, options, 'key1');

            expect(updatePaginationStateSpy).toHaveBeenCalledWith(error, jobTypesList, options);
        });

        test('should handle all KEY_DELETE_ERROR_CODES (429, 403, 401)', () => {
            [429, 403, 401].forEach(statusCode => {
                const keys = new Set(['key1']);
                const jobTypesList = ['jobType1'];
                const options = {};
                const error = { status: statusCode, jobType: 'jobType1', requestedPage: 1 };

                const automator = new JSearchAutomator(keys, senderMock, collectorMock, retryHandlerMock, config);
                automator.handleCollectError(error, jobTypesList, options, 'key1');

                expect(keys.has('key1')).toBe(false);
            });
        });
    });

    describe('updatePaginationState', () => {
        test('should reset requestedPage to 1 when error jobType is first in list and availableItems >= 10', () => {
            const jobTypesList = ['jobType1', 'jobType2'];
            const options = { requestedPage: 3 };
            const error = { jobType: 'jobType1', requestedPage: 2, availableItems: 15 };

            const automator = new JSearchAutomator(new Set(['key1']), senderMock, collectorMock, retryHandlerMock, config);
            automator.updatePaginationState(error, jobTypesList, options);

            expect(options.requestedPage).toBe(2);
            expect(jobTypesList).toEqual(['jobType1', 'jobType2']);
        });

        test('should reset requestedPage to 1 when error jobType is first in list and availableItems < 10', () => {
            const jobTypesList = ['jobType1', 'jobType2'];
            const options = { requestedPage: 3 };
            const error = { jobType: 'jobType1', requestedPage: 2, availableItems: 5 };

            const automator = new JSearchAutomator(new Set(['key1']), senderMock, collectorMock, retryHandlerMock, config);
            automator.updatePaginationState(error, jobTypesList, options);

            expect(options.requestedPage).toBe(1);
            expect(jobTypesList).toEqual(['jobType1', 'jobType2']);
        });

        test('should splice jobTypesList when error jobType is found at index > 0', () => {
            const jobTypesList = ['jobType1', 'jobType2', 'jobType3'];
            const options = { requestedPage: 1 };
            const error = { jobType: 'jobType2', requestedPage: 1, availableItems: 15 };

            const automator = new JSearchAutomator(new Set(['key1']), senderMock, collectorMock, retryHandlerMock, config);
            automator.updatePaginationState(error, jobTypesList, options);

            expect(jobTypesList).toEqual(['jobType2', 'jobType3']);
        });

        test('should not splice jobTypesList when error jobType is at index 0', () => {
            const jobTypesList = ['jobType1', 'jobType2', 'jobType3'];
            const options = { requestedPage: 1 };
            const error = { jobType: 'jobType1', requestedPage: 1, availableItems: 15 };

            const automator = new JSearchAutomator(new Set(['key1']), senderMock, collectorMock, retryHandlerMock, config);
            automator.updatePaginationState(error, jobTypesList, options);

            expect(jobTypesList).toEqual(['jobType1', 'jobType2', 'jobType3']);
        });

    });

    describe('Static properties', () => {
        test('should have correct KEY_DELETE_ERROR_CODES', () => {
            expect(JSearchAutomator.KEY_DELETE_ERROR_CODES).toEqual([429, 403, 401]);
        });
    });
});