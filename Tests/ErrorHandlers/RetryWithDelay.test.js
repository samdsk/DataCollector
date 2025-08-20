const RetryWithDelay = require('../../src/DataCollector/ErrorHandlingStrategies/RetryWithDelay');
const MaxRetriesReachedError = require('../../src/DataCollector/Errors/MaxRetriesReachedError');
const TooManyBadRequestsError = require('../../src/DataCollector/Errors/TooManyBadRequestsError');

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

    describe("Bad Request Handling", () => {
        let retryHandler;
        let now;

        beforeEach(() => {
            now = Date.now();
            jest.spyOn(Date, 'now').mockImplementation(() => now);
            jest.spyOn(RetryWithDelay, 'sleep').mockImplementation(() => Promise.resolve());
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('should track 400 errors separately and throw TooManyBadRequestsError', async () => {
            retryHandler = new RetryWithDelay(10, [], null, 60000, 3); // 3 bad request threshold
            const operation = jest.fn().mockRejectedValue({ status: 400, message: "Bad Request" });
            const context = { jobType: "Software Engineer" };

            await expect(retryHandler.execute(operation, context))
                .rejects
                .toThrow(TooManyBadRequestsError);

            expect(retryHandler.consecutive400Errors).toBe(3);
            expect(operation).toHaveBeenCalledTimes(3);
        });

        it('should use default threshold of 5 bad requests', async () => {
            retryHandler = new RetryWithDelay(); // Use default threshold
            const operation = jest.fn().mockRejectedValue({ status: 400, message: "Bad Request" });
            const context = { jobType: "Developer" };

            await expect(retryHandler.execute(operation, context))
                .rejects
                .toThrow(TooManyBadRequestsError);

            expect(retryHandler.consecutive400Errors).toBe(5);
            expect(operation).toHaveBeenCalledTimes(5);
        });

        it('should handle 400 errors with response.status format', async () => {
            retryHandler = new RetryWithDelay(10, [], null, 60000, 2);
            const operation = jest.fn().mockRejectedValue({
                response: { status: 400 },
                message: "Bad Request from response"
            });
            const context = { jobType: "Data Scientist" };

            await expect(retryHandler.execute(operation, context))
                .rejects
                .toThrow(TooManyBadRequestsError);

            expect(retryHandler.consecutive400Errors).toBe(2);
        });

        it('should reset 400 error count on successful operation', async () => {
            retryHandler = new RetryWithDelay(10, [], null, 60000, 3);
            let attempts = 0;
            const operation = jest.fn().mockImplementation(() => {
                attempts++;
                if (attempts < 3) {
                    return Promise.reject({ status: 400, message: "Bad Request" });
                }
                return Promise.resolve("success");
            });
            const context = { jobType: "Software Engineer" };

            const result = await retryHandler.execute(operation, context);

            expect(result).toBe("success");
            expect(retryHandler.consecutive400Errors).toBe(0);
            expect(retryHandler.consecutiveErrors).toBe(2);
        });

        it('should not count other error codes toward 400 threshold', async () => {
            retryHandler = new RetryWithDelay(10, [], null, 60000, 2);
            const operation = jest.fn()
                .mockRejectedValueOnce({ status: 500, message: "Server Error" })
                .mockRejectedValueOnce({ status: 400, message: "Bad Request" })
                .mockRejectedValueOnce({ status: 503, message: "Service Unavailable" })
                .mockRejectedValueOnce({ status: 400, message: "Bad Request" })
                .mockResolvedValueOnce("success");

            const context = { jobType: "Software Engineer" };
            const result = await retryHandler.execute(operation, context);

            expect(result).toBe("success");
            expect(retryHandler.consecutive400Errors).toBe(0); // Reset on success
            expect(retryHandler.consecutiveErrors).toBe(4);

        });

        it('should include correct job type in TooManyBadRequestsError', async () => {
            retryHandler = new RetryWithDelay(10, [], null, 60000, 2);
            const operation = jest.fn().mockRejectedValue({ status: 400, message: "Bad Request" });
            const context = { jobType: "UX Designer" };

            try {
                await retryHandler.execute(operation, context);
                fail('Should have thrown TooManyBadRequestsError');
            } catch (error) {
                expect(error).toBeInstanceOf(TooManyBadRequestsError);
                expect(error.jobType).toBe("UX Designer");
                expect(error.consecutiveErrors).toBe(2);
                expect(error.originalError.status).toBe(400);
            }
        });

        it('should handle context without jobType', async () => {
            retryHandler = new RetryWithDelay(10, [], null, 60000, 2);
            const operation = jest.fn().mockRejectedValue({ status: 400, message: "Bad Request" });
            const context = {}; // No jobType

            try {
                await retryHandler.execute(operation, context);
                fail('Should have thrown TooManyBadRequestsError');
            } catch (error) {
                expect(error).toBeInstanceOf(TooManyBadRequestsError);
                expect(error.jobType).toBeUndefined();
            }
        });

        it('should reset 400 error count after error window expires', async () => {
            retryHandler = new RetryWithDelay(10, [], null, 5000, 3); // 5 second window
            const operation = jest.fn()
                .mockRejectedValueOnce({ status: 400, message: "Bad Request" })
                .mockRejectedValueOnce({ status: 400, message: "Bad Request" })
                .mockResolvedValueOnce("success")
                .mockResolvedValueOnce("success");

            const context = { jobType: "Software Engineer" };

            // First attempt - 2 bad requests
            try {
                await retryHandler.execute(operation, context);
            } catch (error) {
                expect(retryHandler.consecutive400Errors).toBe(2);
            }

            // Move beyond error window
            now += 6000;

            // Should reset and succeed
            const result = await retryHandler.execute(operation, context);
            expect(result).toBe("success");
            expect(retryHandler.consecutive400Errors).toBe(0);
        });

        it('should prioritize TooManyBadRequestsError over MaxRetriesReachedError', async () => {
            retryHandler = new RetryWithDelay(2, [], null, 60000, 2); // Low max retries, low 400 threshold
            const operation = jest.fn().mockRejectedValue({ status: 400, message: "Bad Request" });
            const context = { jobType: "Software Engineer" };

            await expect(retryHandler.execute(operation, context))
                .rejects
                .toThrow(TooManyBadRequestsError);

            expect(retryHandler.consecutive400Errors).toBe(2);
            expect(retryHandler.consecutiveErrors).toBe(2);
        });

        it('should still throw MaxRetriesReachedError for non-400 errors', async () => {
            retryHandler = new RetryWithDelay(2, [], null, 60000, 10); // High 400 threshold, low max retries
            const operation = jest.fn().mockRejectedValue({ status: 500, message: "Server Error" });
            const context = { jobType: "Software Engineer" };

            await expect(retryHandler.execute(operation, context))
                .rejects
                .toThrow(MaxRetriesReachedError);

            expect(retryHandler.consecutive400Errors).toBe(0);
            expect(retryHandler.consecutiveErrors).toBe(2);
        });
    });

});
