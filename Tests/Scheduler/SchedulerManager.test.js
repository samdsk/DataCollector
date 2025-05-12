const SchedulerManager = require('../../Library/Schedulers/SchedulerManager');
const {Scheduler} = require('../../Library/Schedulers/Scheduler');
const CollectorEventEmitter = require('../../Library/Schedulers/CollectorEventEmitter');
const Logger = require("../../Library/Loggers/CollectorLogger");

jest.mock('../../Library/Schedulers/Scheduler');
jest.mock('../../Library/Schedulers/CollectorEventEmitter');
jest.mock('../../Library/Loggers/CollectorLogger');

describe('SchedulerManager', () => {
    let mockProcessRegistry, mockNextRunStrategy, schedulerManager;

    beforeEach(() => {
        mockProcessRegistry = {
            executeAll: jest.fn().mockResolvedValue(['Process1', 'Process2']),
        };
        mockNextRunStrategy = jest.fn().mockReturnValue('mock-time');
        CollectorEventEmitter.mockClear();
        Scheduler.mockClear();
        schedulerManager = new SchedulerManager(mockProcessRegistry, mockNextRunStrategy);
    });

    describe('initialize', () => {
        it('should initialize scheduler and setup the emitter event', async () => {
            const mockOn = jest.fn();
            const mockStart = jest.fn();
            const mockGetNextExecutionTime = jest.fn().mockReturnValue('mock-next-execution-time');

            schedulerManager.emitter.on = mockOn;
            schedulerManager.scheduler.start = mockStart;
            schedulerManager.scheduler.getNextExecutionTime = mockGetNextExecutionTime;

            schedulerManager.initialize();

            expect(mockOn).toHaveBeenCalledWith(expect.any(String), expect.any(Function));
            expect(mockStart).toHaveBeenCalledWith('mock-time');
            expect(Logger.info).toHaveBeenCalledWith(
                'Scheduler initialized with next execution at mock-next-execution-time'
            );
        });

        it('should invoke emitter listener to execute all processes', async () => {
            const mockOn = jest.fn((event, listener) => listener());
            schedulerManager.emitter.on = mockOn;

            schedulerManager.initialize();

            expect(mockProcessRegistry.executeAll).toHaveBeenCalled();
            expect(Logger.info).toHaveBeenCalledWith("Scheduler initialized with next execution at undefined");
        });
    });

});