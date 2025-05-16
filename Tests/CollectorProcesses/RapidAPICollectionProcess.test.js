const RapidAPICollectionProcess = require('../../src/DataCollector/CollectorProcesses/RapidAPICollectorProcess');
const Logger = require("../../src/DataCollector/Loggers/CollectorLogger");

describe('RapidAPICollectionProcess', () => {
    let automatorFactoryMock, resultProcessorMock, configLoaderMock, rapidAPICollectionProcess;

    beforeEach(() => {
        automatorFactoryMock = {
            createAutomator: jest.fn(),
        };

        resultProcessorMock = {
            process: jest.fn(),
        };

        configLoaderMock = {
            loadJobTypes: jest.fn(),
            loadKeys: jest.fn(),
            validateConfiguration: jest.fn(),
        };

        jest.spyOn(Logger, 'info').mockImplementation(() => {
        });
        jest.spyOn(Logger, 'error').mockImplementation(() => {
        });

        rapidAPICollectionProcess = new RapidAPICollectionProcess(
            automatorFactoryMock,
            resultProcessorMock,
            configLoaderMock
        );
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should execute successfully and return processed results', async () => {
        const jobListMock = ['job1', 'job2'];
        const keysMock = {apiKey: 'test-key'};
        const resultsMock = ['result1', 'result2'];
        const processedResultsMock = ['processedResult1', 'processedResult2'];

        configLoaderMock.loadJobTypes.mockResolvedValue(jobListMock);
        configLoaderMock.loadKeys.mockResolvedValue(keysMock);
        configLoaderMock.validateConfiguration.mockReturnValue(true);
        const automatorMock = {
            automate: jest.fn().mockResolvedValue(resultsMock),
        };
        automatorFactoryMock.createAutomator.mockReturnValue(automatorMock);
        resultProcessorMock.process.mockResolvedValue(processedResultsMock);

        const result = await rapidAPICollectionProcess.execute();

        expect(configLoaderMock.loadJobTypes).toHaveBeenCalled();
        expect(configLoaderMock.loadKeys).toHaveBeenCalled();
        expect(configLoaderMock.validateConfiguration).toHaveBeenCalledWith(jobListMock, keysMock);
        expect(automatorFactoryMock.createAutomator).toHaveBeenCalledWith(keysMock);
        expect(automatorMock.automate).toHaveBeenCalledWith(jobListMock);
        expect(resultProcessorMock.process).toHaveBeenCalledWith(resultsMock);
        expect(result).toEqual(processedResultsMock);
    });

    it('should throw an error if configuration is invalid', async () => {
        const jobListMock = ['job1', 'job2'];
        const keysMock = {apiKey: 'test-key'};

        configLoaderMock.loadJobTypes.mockResolvedValue(jobListMock);
        configLoaderMock.loadKeys.mockResolvedValue(keysMock);
        configLoaderMock.validateConfiguration.mockReturnValue(false);

        await expect(rapidAPICollectionProcess.execute()).rejects.toThrow('RapidAPIProcess : Invalid configuration');

        expect(configLoaderMock.loadJobTypes).toHaveBeenCalled();
        expect(configLoaderMock.loadKeys).toHaveBeenCalled();
        expect(configLoaderMock.validateConfiguration).toHaveBeenCalledWith(jobListMock, keysMock);
        expect(Logger.info).toHaveBeenCalledWith('RapidAPIProcess : Skipping today\'s execution due to error. Waiting for next scheduled run.');
    });

    it('should handle errors thrown during execution and log them', async () => {
        const errorMock = new Error('Test error');

        configLoaderMock.loadJobTypes.mockRejectedValue(errorMock);

        await expect(rapidAPICollectionProcess.execute()).rejects.toThrow(errorMock);

        expect(configLoaderMock.loadJobTypes).toHaveBeenCalled();
        expect(Logger.info).toHaveBeenCalledWith('RapidAPIProcess : Skipping today\'s execution due to error. Waiting for next scheduled run.');
        expect(Logger.error).toHaveBeenCalledWith(errorMock);
    });
});