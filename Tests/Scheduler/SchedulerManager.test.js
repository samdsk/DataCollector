const SchedulerManager = require('../../src/DataCollector/Schedulers/SchedulerManager');
const {Scheduler} = require('../../src/DataCollector/Schedulers/Scheduler');
const CollectorEventEmitter = require('../../src/DataCollector/Schedulers/CollectorEventEmitter');
const Logger = require("../../src/DataCollector/Loggers/CollectorLogger");

// Mock dependencies
jest.mock('../../src/DataCollector/Schedulers/Scheduler');
jest.mock('../../src/DataCollector/Schedulers/CollectorEventEmitter');
jest.mock('../../src/DataCollector/Loggers/CollectorLogger');

describe('SchedulerManager', () => {
    let mockScheduler, mockEventEmitter, mockProcessRegistry, mockRunStrategy, schedulerManager;

    beforeEach(() => {
        // Set up mock dependencies

        // Mock the Scheduler instance
        mockScheduler = {
            start: jest.fn(),
            stop: jest.fn(),
            emit: jest.fn(),
            getNextExecutionTime: jest.fn().mockReturnValue('mock-next-execution-time'),
        };

        // Mock the EventEmitter instance
        mockEventEmitter = {
            on: jest.fn(),
            emit: jest.fn(),
        };

        // Mock the ProcessRegistry with a function to simulate process execution
        mockProcessRegistry = {
            executeAll: jest.fn().mockResolvedValue(['Process1', 'Process2']),
        };

        // Mock the runStrategy to return a mock rule
        mockRunStrategy = {
            getScheduleRule: jest.fn().mockReturnValue('mock-schedule-rule'),
        };

        // Clear all previous mock calls
        CollectorEventEmitter.mockClear();
        Scheduler.mockClear();
        Logger.info.mockClear();

        // Initialize the SchedulerManager instance with injected mocks
        schedulerManager = new SchedulerManager(
            mockScheduler,
            mockEventEmitter,
            mockProcessRegistry,
            mockRunStrategy
        );
    });

    describe('initialize', () => {
        it('should initialize scheduler and setup the event emitter', async () => {
            // Run the initialize method
            schedulerManager.initialize();

            // Assert that the eventEmitter.on was registered correctly
            expect(mockEventEmitter.on).toHaveBeenCalledWith(expect.any(String), expect.any(Function));

            // Assert that the scheduler.start was called with the correct schedule rule
            expect(mockScheduler.start).toHaveBeenCalledWith('mock-schedule-rule');

            // Assert that the next execution time was logged
            expect(Logger.info).toHaveBeenCalledWith(
                'Scheduler initialized with next execution at mock-next-execution-time'
            );
        });

        it('should invoke the event emitter listener to execute all processes', async () => {
            // Mock the eventEmitter to immediately call the listener
            mockEventEmitter.on = jest.fn((event, listener) => listener());

            // Call initialize
            schedulerManager.initialize();

            // Verify that executeAll was called
            expect(mockProcessRegistry.executeAll).toHaveBeenCalled();

            // Assert that the logs contain process execution message
            expect(Logger.info).toHaveBeenCalledWith(
                "Scheduler initialized with next execution at mock-next-execution-time"
            );

            expect(Logger.info).toHaveBeenCalledWith(
                "Scheduler initialized with next execution at mock-next-execution-time"
            );
        });
    });

    describe('setupAPITrigger', () => {
        it('should setup API trigger correctly and handle process messages', () => {
            // Mock the process.on and process.send methods
            const processOnMock = jest.spyOn(process, 'on').mockImplementation((event, listener) => {
                if (event === 'message') {
                    listener({to: 'COLLECTOR', code: 'api_trigger'});
                }
            });

            const processSendMock = jest.spyOn(process, 'send').mockImplementation(jest.fn());

            // Run the API setup logic
            schedulerManager.setupAPITrigger();

            // Verify that process.on was called
            expect(processOnMock).toHaveBeenCalledWith('message', expect.any(Function));

            // Assert that the scheduler.emit was invoked
            expect(mockScheduler.emit).toHaveBeenCalledWith(expect.any(String));

            // Assert that the appropriate message was sent via process.send
            expect(processSendMock).toHaveBeenCalledWith({to: expect.anything(), from: expect.anything(), code: 200});

            // Restore the original methods
            processOnMock.mockRestore();
            processSendMock.mockRestore();
        });
    });
});