const RetryWithDelay = require('../../Library/CollectorErrorHandler/RetryWithDelay');
const MaxRetriesReachedError = require('../../Library/CollectorErrorHandler/MaxRetriesReachedError');

describe('RetryWithDelay', () => {
    describe('constructor', () => {
        it('should initialize with default values', () => {
            const retry = new RetryWithDelay();
            expect(retry.maxRetries).toBe(5);
            expect(retry.excludedErrorCodes).toEqual([]);
            expect(typeof retry.onRetry).toBe('function');
        });

        it('should initialize with custom values', () => {
            const onRetry = jest.fn();
            const retry = new RetryWithDelay(3, [400, 401], onRetry);
            expect(retry.maxRetries).toBe(3);
            expect(retry.excludedErrorCodes).toEqual([400, 401]);
            expect(retry.onRetry).toBe(onRetry);
        });

        it('should throw error for negative maxRetries', () => {
            expect(() => new RetryWithDelay(-1)).toThrow('maxRetries must be a positive integer');
        });
    });

    describe('execute', () => {
        let retryInstance;

        beforeEach(() => {
            jest.spyOn(RetryWithDelay, 'sleep').mockImplementation(() => Promise.resolve());
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('should successfully execute operation on first attempt', async () => {
            const operation = jest.fn().mockResolvedValue('success');
            retryInstance = new RetryWithDelay(3, []);

            const result = await retryInstance.execute(operation);

            expect(result).toBe('success');
            expect(operation).toHaveBeenCalledTimes(1);
        });

        it('should retry and succeed on later attempt', async () => {
            let attempts = 0;
            const operation = jest.fn().mockImplementation(() => {
                attempts++;
                if (attempts < 3) throw new Error('temporary failure');
                return Promise.resolve('success');
            });

            retryInstance = new RetryWithDelay(5, []);
            const result = await retryInstance.execute(operation);

            expect(result).toBe('success');
            expect(operation).toHaveBeenCalledTimes(3);
        });

        it('should not retry for excluded error codes', async () => {
            const error = {status: 400};
            const operation = jest.fn().mockRejectedValue(error);

            retryInstance = new RetryWithDelay(3, [400]);

            await expect(retryInstance.execute(operation)).rejects.toEqual(error);
            expect(operation).toHaveBeenCalledTimes(1);
        });

        it('should pass context to onRetry callback', async () => {
            const onRetry = jest.fn();
            const context = {key: 'value'};
            const operation = jest.fn()
                .mockRejectedValueOnce(new Error('temp error'))
                .mockResolvedValueOnce('success');

            retryInstance = new RetryWithDelay(3, [], onRetry);

            await retryInstance.execute(operation, context);

            expect(onRetry).toHaveBeenCalledWith(1, expect.any(Number), expect.any(Error), context);
        });

        it('should throw MaxRetriesReachedError after max attempts', async () => {
            const operation = jest.fn().mockRejectedValue(new Error('persistent failure'));
            retryInstance = new RetryWithDelay(2);

            await expect(retryInstance.execute(operation))
                .rejects
                .toThrow(MaxRetriesReachedError);
            expect(operation).toHaveBeenCalledTimes(3); // initial + 2 retries
        });

        it('should use correct delay sequence', async () => {
            const operation = jest.fn().mockRejectedValue(new Error('failure'));
            const sleepSpy = jest.spyOn(RetryWithDelay, 'sleep');

            retryInstance = new RetryWithDelay(2);

            try {
                await retryInstance.execute(operation);
            } catch (error) {
                expect(error).toBeInstanceOf(MaxRetriesReachedError);
            }

            expect(sleepSpy).toHaveBeenCalledWith(500);  // First retry
            expect(sleepSpy).toHaveBeenCalledWith(1000); // Second retry
        });

        it('should throw error if operation is not a function', async () => {
            retryInstance = new RetryWithDelay();

            await expect(retryInstance.execute(null))
                .rejects
                .toThrow('operation must be a function');
        });
    });

    describe('shouldRetry', () => {
        it('should return true for errors without status', () => {
            const retry = new RetryWithDelay(3, [400]);
            expect(retry.shouldRetry(new Error('generic error'))).toBe(true);
        });

        it('should return false for excluded error codes', () => {
            const retry = new RetryWithDelay(3, [400, 401]);
            expect(retry.shouldRetry({status: 400})).toBe(false);
            expect(retry.shouldRetry({status: 401})).toBe(false);
        });

        it('should return true for non-excluded error codes', () => {
            const retry = new RetryWithDelay(3, [400]);
            expect(retry.shouldRetry({status: 500})).toBe(true);
        });
    });
});
