// CollectorProcessRegistry.test.js
const CollectorProcessRegistry = require('../src/Library/CollectorProcessRegistry');
const Logger = require("../src/Library/Loggers/CollectorLogger");

jest.mock("../src/Library/Loggers/CollectorLogger", () => ({
    info: jest.fn(),
    error: jest.fn(),
}));

describe('CollectorProcessRegistry', () => {
    let registry;

    beforeEach(() => {
        registry = new CollectorProcessRegistry();
        jest.clearAllMocks();
    });

    describe('register', () => {
        it('should register a valid process', () => {
            const validProcess = {execute: jest.fn()};

            registry.register(validProcess);

            expect(registry.processes).toContain(validProcess);
            expect(Logger.info).toHaveBeenCalledWith(`Registered process: ${validProcess.constructor.name}`);
        });

        it('should throw an error if process does not have an execute method', () => {
            const invalidProcess = {};

            expect(() => registry.register(invalidProcess)).toThrow('Process must have an execute method');
            expect(Logger.info).not.toHaveBeenCalled();
        });
    });

    describe('executeAll', () => {
        it('should execute all registered processes successfully', async () => {
            const process1 = {execute: jest.fn().mockResolvedValue('result1')};
            const process2 = {execute: jest.fn().mockResolvedValue('result2')};

            registry.register(process1).register(process2);

            const results = await registry.executeAll();

            expect(results).toEqual([
                {process: process1.constructor.name, success: true, result: 'result1'},
                {process: process2.constructor.name, success: true, result: 'result2'},
            ]);
            expect(Logger.info).toHaveBeenCalledWith('Executing 2 registered processes');
            expect(Logger.info).toHaveBeenCalledWith(`Executing process: ${process1.constructor.name}`);
            expect(Logger.info).toHaveBeenCalledWith(`Executing process: ${process2.constructor.name}`);
            expect(process1.execute).toHaveBeenCalled();
            expect(process2.execute).toHaveBeenCalled();
        });

        it('should handle errors when executing a process', async () => {
            const process1 = {execute: jest.fn().mockResolvedValue('result1')};
            const process2 = {
                execute: jest.fn().mockRejectedValue(new Error('Execution failed')),
            };

            registry.register(process1).register(process2);

            const results = await registry.executeAll();

            expect(results).toEqual([
                {process: process1.constructor.name, success: true, result: 'result1'},
                {process: process2.constructor.name, success: false, error: 'Execution failed'},
            ]);
            expect(Logger.info).toHaveBeenCalledWith('Executing 2 registered processes');
            expect(Logger.info).toHaveBeenCalledWith(`Executing process: ${process1.constructor.name}`);
            expect(Logger.info).toHaveBeenCalledWith(`Executing process: ${process2.constructor.name}`);
            expect(Logger.error).toHaveBeenCalledWith(`Error executing process ${process2.constructor.name}: Execution failed`);
            expect(process1.execute).toHaveBeenCalled();
            expect(process2.execute).toHaveBeenCalled();
        });

        it('should return an empty array if no processes are registered', async () => {
            const results = await registry.executeAll();

            expect(results).toEqual([]);
            expect(Logger.info).toHaveBeenCalledWith('Executing 0 registered processes');
        });
    });
});