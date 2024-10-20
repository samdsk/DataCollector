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
        automator = new RapidAPIAutomator(keySet, {});
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
