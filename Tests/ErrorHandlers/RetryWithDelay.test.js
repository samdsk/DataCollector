const RetryWithDelay = require('../../src/DataCollector/ErrorHandlers/RetryWithDelay');
const MaxRetriesReachedError = require('../../src/DataCollector/Errors/MaxRetriesReachedError');

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
            retryInstance = new RetryWithDelay(3);

            await expect(retryInstance.execute(operation))
                .rejects
                .toThrow(MaxRetriesReachedError);
            expect(operation).toHaveBeenCalledTimes(3); // initial + 2 retries
        });

        it('should use correct delay sequence', async () => {
            const operation = jest.fn().mockRejectedValue(new Error('failure'));
            const sleepSpy = jest.spyOn(RetryWithDelay, 'sleep');

            retryInstance = new RetryWithDelay(3);

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

    describe("Error Window", () => {
        let retryHandler;
        let now;

        beforeEach(() => {
            now = Date.now();
            jest.spyOn(Date, 'now').mockImplementation(() => now);
            retryHandler = new RetryWithDelay(3, [], null, 5000); // 5 second window
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it("should reset error count after error window", async () => {
            const operation = jest.fn()
                .mockRejectedValueOnce({status: 500, message: "error 1"})
                .mockRejectedValueOnce({status: 500, message: "error 2"})
                .mockRejectedValueOnce({status: 500, message: "error 3"})
                .mockRejectedValueOnce({status: 500, message: "error 4"})
                .mockResolvedValueOnce("success");

            // First attempt
            await expect(retryHandler.execute(operation)).rejects.toThrow();

            // Move time forward beyond error window
            now += 6000;

            // Next attempt should start with fresh count
            const result = await retryHandler.execute(operation);
            expect(result).toBe("success");
            expect(retryHandler.consecutiveErrors).toBe(1);
        });

        it("should maintain error count within window", async () => {
            const operation = jest.fn()
                .mockRejectedValue({status: 500});

            // First attempt
            await expect(retryHandler.execute(operation)).rejects.toThrow();

            // Move time forward but stay within window
            now += 2000;

            // Second attempt should consider previous errors
            await expect(retryHandler.execute(operation))
                .rejects
                .toThrow(MaxRetriesReachedError);

            expect(retryHandler.consecutiveErrors).toBe(4);
        });

        it("should handle multiple error windows", async () => {
            const operation = jest.fn()
                .mockRejectedValueOnce({status: 500})
                .mockRejectedValueOnce({status: 500})
                .mockRejectedValueOnce({status: 500})
                .mockRejectedValueOnce({status: 500})
                .mockResolvedValueOnce("success");

            // First window
            await expect(retryHandler.execute(operation)).rejects.toThrow();

            // Move to next error window
            now += 6000;

            const result = await retryHandler.execute(operation);
            expect(result).toBe("success");
            expect(retryHandler.consecutiveErrors).toBe(1);
        });

        it("should handle rapid successive errors", async () => {
            const operation = jest.fn()
                .mockRejectedValue({status: 500});

            // First set of attempts
            await expect(retryHandler.execute(operation)).rejects.toThrow();

            // Small time advancement
            now += 100;

            // Should still be within error window
            await expect(retryHandler.execute(operation))
                .rejects
                .toThrow(MaxRetriesReachedError);

            expect(retryHandler.consecutiveErrors).toBe(4);
        });
    });
});
