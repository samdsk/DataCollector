const RetryWithDelay = require('../../Library/CollectorErrorHandler/RetryWithDelay');
const MaxRetriesReachedError = require('../../Library/CollectorErrorHandler/MaxRetriesReachedError');

describe('RetryWithDelay', () => {
    describe('execute', () => {
        it('should successfully execute the operation on the first attempt', async () => {
            const operation = jest.fn(async () => 'success');
            const retryInstance = new RetryWithDelay();

            const result = await retryInstance.execute(operation);
            expect(result).toBe('success');
            expect(operation).toHaveBeenCalledTimes(1);
        });

        it('should retry the operation and succeed on the second attempt', async () => {
            let attempt = 0;
            const operation = jest.fn(async () => {
                attempt++;
                if (attempt < 2) throw new Error('failure');
                return 'success';
            });

            const retryInstance = new RetryWithDelay(3);

            const result = await retryInstance.execute(operation);
            expect(result).toBe('success');
            expect(operation).toHaveBeenCalledTimes(2);
        });

        it('should stop retrying after reaching max retries and throw MaxRetriesReachedError', async () => {
            const operation = jest.fn(() => {
                throw new Error('failure');
            });

            const retryInstance = new RetryWithDelay(2);

            await expect(retryInstance.execute(operation)).rejects.toThrow(MaxRetriesReachedError);
            expect(operation).toHaveBeenCalledTimes(3); // initial try + 2 retries
        });

        it('should call onRetry callback with the correct arguments', async () => {
            let attempt = 0;
            const operation = jest.fn(async () => {
                attempt++;
                if (attempt < 2) throw new Error('failure');
                return 'success';
            });

            const onRetry = jest.fn();
            const retryInstance = new RetryWithDelay(3, onRetry);

            const result = await retryInstance.execute(operation);
            expect(result).toBe('success');
            expect(onRetry).toHaveBeenCalledTimes(1);
            expect(onRetry).toHaveBeenCalledWith(1, 500, expect.any(Error)); // Retry count is 1-based
        });

        it('should respect custom base delays during retries', async () => {
            RetryWithDelay.getDelay = jest.fn(() => 1000);
            const operation = jest.fn(async () => {
                throw new Error('failure');
            });

            jest.useRealTimers();

            const retryInstance = new RetryWithDelay(1);
            await expect(retryInstance.execute(operation)).rejects.toThrow(MaxRetriesReachedError);

        });

        it('should not retry when maxRetries is set to 0', async () => {
            const operation = jest.fn(async () => {
                throw new Error('failure');
            });

            const retryInstance = new RetryWithDelay(0); // No retries allowed

            await expect(retryInstance.execute(operation)).rejects.toThrow(Error);
            expect(operation).toHaveBeenCalledTimes(1); // Only one attempt
        });

        it('should retry default number of times when maxRetries is not provided', async () => {
            const operation = jest.fn(async () => {
                throw new Error('failure');
            });

            const retryInstance = new RetryWithDelay(); // Using default `maxRetries = 5`

            await expect(retryInstance.execute(operation)).rejects.toThrow(MaxRetriesReachedError);
            expect(operation).toHaveBeenCalledTimes(6); // 1 initial try + 5 retries
        }, 20000);

        it('should apply correct delays for retries based on retry count', async () => {
            const DELAYS = [500, 1000, 2000, 5000, 10000];
            RetryWithDelay.getDelay = jest.fn((retryCount) => DELAYS[retryCount]);

            const customSleepSpy = jest.spyOn(RetryWithDelay, 'sleep');

            const operation = jest.fn(async () => {
                throw new Error('failure');
            });

            const retryInstance = new RetryWithDelay(3);

            await expect(retryInstance.execute(operation)).rejects.toThrow(MaxRetriesReachedError);

            // Check delay values for the retries
            expect(RetryWithDelay.getDelay.mock.calls).toEqual([[0], [1], [2]]);
            expect(customSleepSpy).toHaveBeenCalledWith(500);
            expect(customSleepSpy).toHaveBeenCalledWith(1000);
            expect(customSleepSpy).toHaveBeenCalledWith(2000);
        });

        it('should return success if the operation succeeds after some retries', async () => {
            let attempt = 0;

            const operation = jest.fn(async () => {
                attempt++;
                if (attempt < 3) {
                    throw new Error('failure');
                }
                return 'success';
            });

            const retryInstance = new RetryWithDelay(5);

            const result = await retryInstance.execute(operation);

            expect(result).toBe('success');
            expect(operation).toHaveBeenCalledTimes(3); // 2 failures + 1 success
        });

        it('should throw if the operation is not a function', async () => {
            const retryInstance = new RetryWithDelay();

            const invalidOperation = null; // Not a valid function
            await expect(retryInstance.execute(invalidOperation)).rejects.toThrow(new TypeError("operation must be a function"));
        });

        it('should handle non-Error objects thrown in the operation', async () => {
            const operation = jest.fn(async () => {
                throw 'failure string'; // Throws a string instead of an Error object
            });

            const retryInstance = new RetryWithDelay(2);

            await expect(retryInstance.execute(operation)).rejects.toThrow(MaxRetriesReachedError);
            expect(operation).toHaveBeenCalledTimes(3); // 1 initial try + 2 retries
        });

        it('should correctly call onRetry with proper arguments', async () => {
            const operation = jest.fn(async () => {
                throw new Error('failure');
            });

            const onRetry = jest.fn();
            RetryWithDelay.getDelay = jest.fn(() => 0); // No delay

            const retryInstance = new RetryWithDelay(3, onRetry);

            await expect(retryInstance.execute(operation)).rejects.toThrow(MaxRetriesReachedError);

            expect(onRetry).toHaveBeenCalledTimes(3); // Called for each retry
            expect(onRetry).toHaveBeenCalledWith(1, 0, expect.any(Error)); // Retry count 1
            expect(onRetry).toHaveBeenCalledWith(3, 0, expect.any(Error)); // Retry count 3
        });

        it('should throw an error for negative maxRetries', async () => {
            expect(() => new RetryWithDelay(-5)
            ).toThrow(new Error('maxRetries must be a positive integer'));
        });

        it('should handle different error types during retries', async () => {
            const operation = jest.fn(async () => {
                const errors = [new Error('Network error'), new Error('Timeout'), new Error('Server unavailable'),];
                throw errors[operation.mock.calls.length - 1] || new Error('Unknown error');
            });

            const retryInstance = new RetryWithDelay(3);

            await expect(retryInstance.execute(operation)).rejects.toThrow(MaxRetriesReachedError);
            expect(operation).toHaveBeenCalledTimes(4);
        });

    });
});