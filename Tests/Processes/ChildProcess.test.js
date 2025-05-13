const ChildProcess = require('../../src/Processes/ChildProcess');
const {fork} = require('child_process');
const Logger = require('../../src/DataCollector/Loggers/MasterProcessLogger');

jest.mock('child_process', () => ({
    fork: jest.fn(),
}));

jest.mock('../../src/DataCollector/Loggers/MasterProcessLogger', () => ({
    info: jest.fn(),
    error: jest.fn(),
}));

describe('ChildProcess', () => {
    const mockConfig = {name: 'TestProcess', path: './testPath'};
    let childProcess;

    beforeEach(() => {
        fork.mockReset();
        Logger.info.mockReset();
        Logger.error.mockReset();

        childProcess = new ChildProcess(mockConfig);
    });

    test('should correctly set the message handler', () => {
        const mockHandler = {handleMessage: jest.fn()};

        childProcess.setMessageHandler(mockHandler);

        expect(childProcess.messageHandler).toBe(mockHandler);
    });

    test('should start the process and set up event listeners', () => {
        const mockProcess = {
            on: jest.fn(),
            pid: 1234,
        };
        fork.mockReturnValue(mockProcess);

        const result = childProcess.start();

        expect(result).toBe(mockProcess);
        expect(Logger.info).toHaveBeenCalledWith('Process TestProcess started with PID: 1234');
        expect(mockProcess.on).toHaveBeenCalledWith('exit', expect.any(Function));
        expect(mockProcess.on).toHaveBeenCalledWith('error', expect.any(Function));
        expect(mockProcess.on).toHaveBeenCalledWith('message', expect.any(Function));
    });

    test('should handle process exit and restart on non-zero code', () => {
        const mockProcess = {
            on: jest.fn(),
            pid: 1234,
        };
        fork.mockReturnValue(mockProcess);

        childProcess.start();
        const mockExitCallback = mockProcess.on.mock.calls.find(call => call[0] === 'exit')[1];

        mockExitCallback(1, null);

        expect(Logger.info).toHaveBeenCalledWith('Process TestProcess crashed with code 1. Restarting...');
        expect(fork).toHaveBeenCalledTimes(2);
    });

    test('should gracefully handle process exit with zero code', () => {
        const mockProcess = {
            on: jest.fn(),
            pid: 1234,
        };
        fork.mockReturnValue(mockProcess);

        childProcess.start();
        const mockExitCallback = mockProcess.on.mock.calls.find(call => call[0] === 'exit')[1];

        mockExitCallback(0, null);

        expect(Logger.info).toHaveBeenCalledWith('Process TestProcess exited with code 0.');
        expect(fork).toHaveBeenCalledTimes(1);
    });

    test('should log error on process error event', () => {
        const mockProcess = {
            on: jest.fn(),
            pid: 1234,
        };
        fork.mockReturnValue(mockProcess);

        childProcess.start();
        const mockErrorCallback = mockProcess.on.mock.calls.find(call => call[0] === 'error')[1];
        const mockError = new Error('Test error');

        mockErrorCallback(mockError);

        expect(Logger.info).toHaveBeenCalledWith('ERROR: Failed to start process TestProcess: 1234');
        expect(Logger.error).toHaveBeenCalledWith(mockError);
    });

    test('should pass message to handler on message event', () => {
        const mockProcess = {
            on: jest.fn(),
            pid: 1234,
        };
        const mockHandler = {handleMessage: jest.fn()};
        const testMessage = {data: 'test'};

        fork.mockReturnValue(mockProcess);
        childProcess.setMessageHandler(mockHandler);

        childProcess.start();
        const mockMessageCallback = mockProcess.on.mock.calls.find(call => call[0] === 'message')[1];

        mockMessageCallback(testMessage);

        expect(mockHandler.handleMessage).toHaveBeenCalledWith(testMessage, 'TestProcess');
    });

    test('should return true when message is sent successfully', () => {
        const mockProcess = {
            send: jest.fn(),
        };
        childProcess.process = mockProcess;

        const result = childProcess.sendMessage({data: 'test'});

        expect(result).toBe(true);
        expect(mockProcess.send).toHaveBeenCalledWith({data: 'test'});
    });

    test('should return false and log error when message sending fails', () => {
        const error = new Error('Send failed');
        const mockProcess = {
            send: jest.fn(() => {
                throw error;
            }),
        };
        childProcess.process = mockProcess;

        const result = childProcess.sendMessage({data: 'test'});

        expect(result).toBe(false);
        expect(Logger.error).toHaveBeenCalledWith('Failed to send message to TestProcess: Send failed');
    });
});