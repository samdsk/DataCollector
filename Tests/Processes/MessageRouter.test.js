const MessageRouter = require('../../src/Processes/MessageRouter');
const Logger = require('../../src/DataCollector/Loggers/MasterProcessLogger');

jest.mock('../../src/DataCollector/Loggers/MasterProcessLogger', () => ({
    info: jest.fn(),
    error: jest.fn()
}));

describe('MessageRouter', () => {
    let messageRouter;
    let mockProcess;

    beforeEach(() => {
        messageRouter = new MessageRouter();
        mockProcess = {
            sendMessage: jest.fn()
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should register a process', () => {
        messageRouter.registerProcess('process1', mockProcess);

        expect(messageRouter.processes.has('process1')).toBe(true);
        expect(messageRouter.processes.get('process1')).toBe(mockProcess);
    });

    test('should relay message to the correct process', () => {
        messageRouter.registerProcess('process2', mockProcess);

        const message = {to: 'process2', from: 'process1', code: 'testCode'};
        messageRouter.handleMessage(message, 'process1');

        expect(Logger.info).toHaveBeenCalledWith(
            'Relaying message from process1 to process2: testCode'
        );
        expect(mockProcess.sendMessage).toHaveBeenCalledWith(message);
    });

    test('should not relay message if recipient process is the same as the sender', () => {
        messageRouter.registerProcess('process1', mockProcess);

        const message = {to: 'process1', from: 'process1', code: 'testCode'};
        messageRouter.handleMessage(message, 'process1');

        expect(Logger.info).toHaveBeenCalledWith(
            'Relaying message from process1 to process1: testCode'
        );
        expect(mockProcess.sendMessage).not.toHaveBeenCalled();
    });

    test('should log an error if relaying the message fails', () => {
        messageRouter.registerProcess('process3', mockProcess);
        const error = new Error('SendMessage Error');
        mockProcess.sendMessage.mockImplementation(() => {
            throw error;
        });

        const message = {to: 'process3', from: 'process1', code: 'testCode'};
        messageRouter.handleMessage(message, 'process1');

        expect(Logger.info).toHaveBeenCalledWith(
            'Relaying message from process1 to process3: testCode'
        );
        expect(Logger.error).toHaveBeenCalledWith(
            `Failed to relay message: ${error.message}`
        );
    });

    test('should not relay message if recipient process is not registered', () => {
        const message = {to: 'process4', from: 'process1', code: 'testCode'};
        messageRouter.handleMessage(message, 'process1');

        expect(Logger.info).not.toHaveBeenCalled();
        expect(mockProcess.sendMessage).not.toHaveBeenCalled();
    });
});