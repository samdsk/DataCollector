const RapidAPIConfigLoader = require('../../Library/ConfigLoaders/RapidAPIConfigLoader');

const {getJobTypesFromFile, getJSONFromFile} = require("../../Library/Utils/Utils");
const Logger = require("../../Library/Loggers/CollectorLogger");

jest.mock('../../Library/Utils/Utils', () => ({
    getJobTypesFromFile: jest.fn(),
    getJSONFromFile: jest.fn(),
}));

jest.mock('../../Library/Loggers/CollectorLogger', () => ({
    info: jest.fn(),
}));

describe('RapidAPIConfigLoader', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('loadJobTypes', () => {
        it('should load job types from the provided file and log the count', async () => {
            const mockJobList = ['type1', 'type2'];
            getJobTypesFromFile.mockResolvedValue(mockJobList);

            const result = await RapidAPIConfigLoader.loadJobTypes('jobs.json');

            expect(getJobTypesFromFile).toHaveBeenCalledWith('jobs.json');
            expect(Logger.info).toHaveBeenCalledWith('Loaded 2 job types.');
            expect(result).toEqual(mockJobList);
        });

        it('should return an empty array and log when no job types are loaded', async () => {
            getJobTypesFromFile.mockResolvedValue(null);

            const result = await RapidAPIConfigLoader.loadJobTypes('jobs-empty.json');

            expect(getJobTypesFromFile).toHaveBeenCalledWith('jobs-empty.json');
            expect(Logger.info).toHaveBeenCalledWith('Loaded 0 job types.');
            expect(result).toEqual([]);
        });
    });

    describe('loadKeys', () => {
        it('should load keys from the provided file and log the count', async () => {
            const mockKeys = ['key1', 'key2'];
            getJSONFromFile.mockResolvedValue(mockKeys);

            const result = await RapidAPIConfigLoader.loadKeys('keys.json');

            expect(getJSONFromFile).toHaveBeenCalledWith('keys.json');
            expect(Logger.info).toHaveBeenCalledWith('Loaded 2 keys.');
            expect(result).toEqual(mockKeys);
        });

        it('should return an empty array and log when no keys are loaded', async () => {
            getJSONFromFile.mockResolvedValue(null);

            const result = await RapidAPIConfigLoader.loadKeys('keys-empty.json');

            expect(getJSONFromFile).toHaveBeenCalledWith('keys-empty.json');
            expect(Logger.info).toHaveBeenCalledWith('Loaded 0 keys.');
            expect(result).toEqual([]);
        });
    });

    describe('validateConfiguration', () => {
        it('should return false and log when job list is empty', () => {
            const result = RapidAPIConfigLoader.validateConfiguration([], ['key1']);

            expect(Logger.info).toHaveBeenCalledWith('No job types or keys found. Exiting.');
            expect(result).toBe(false);
        });

        it('should return false and log when keys list is empty', () => {
            const result = RapidAPIConfigLoader.validateConfiguration(['type1'], []);

            expect(Logger.info).toHaveBeenCalledWith('No job types or keys found. Exiting.');
            expect(result).toBe(false);
        });

        it('should return true when both job list and keys list are valid', () => {
            const result = RapidAPIConfigLoader.validateConfiguration(['type1'], ['key1']);

            expect(Logger.info).not.toHaveBeenCalled(); // No log should happen in this case
            expect(result).toBe(true);
        });
    });
});