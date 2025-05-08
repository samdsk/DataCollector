const RapidAPIAutomator = require("../Library/Automators/RapidAPIAutomator");
const EventEmitter = require("events");
const {Scheduler, EVENT} = require("../Library/Scheduler");

describe("Scheduler:", () => {
    let scheduler;
    const emitter = new EventEmitter();
    let automator;
    beforeEach(() => {
        jest.useFakeTimers();
        scheduler = new Scheduler(emitter);
        const keySet = new Set(["key1", "key2", "key3"]);

        // Mock dependencies
        const sender = {
            setApiKey: jest.fn(),
            sendRequest: jest.fn()
        };

        const collector = {
            searchJobsByType: jest.fn(),
            logFullResponse: jest.fn(),
            logResults: jest.fn()
        };

        const retryHandler = {
            execute: jest.fn(),
            setExcludedErrorCodes: jest.fn()
        };

        automator = new RapidAPIAutomator(
            keySet,
            sender,
            collector,
            retryHandler,
            {
                API_URL: "test-url",
                API_HOST: "test-host"
            }
        );

    });

    afterEach(() => jest.clearAllTimers());

    it("run scheduler", async () => {
        const spy = jest
            .spyOn(automator, "collect")
            .mockImplementation(async () => Promise.resolve());

        emitter.on(EVENT, () => automator.collect());

        scheduler.start("* * * * * *");
        jest.advanceTimersByTime(3000);

        expect(spy).toHaveBeenCalledTimes(3);

        scheduler.stop();
    });
});
