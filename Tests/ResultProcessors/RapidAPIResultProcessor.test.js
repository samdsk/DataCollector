const RapidAPIResultsProcessor = require('../../src/DataCollector/ResultProcessors/RapidAPIResultProcessor');

// Mock the logger dependencies
jest.mock('../../src/DataCollector/Loggers/ResultsLogger', () => ({
    logResultsToJSONFile: jest.fn()
}));

jest.mock('../../src/DataCollector/Loggers/CollectorLogger', () => ({
    info: jest.fn()
}));

describe('RapidAPIResultsProcessor', () => {
    describe('generateSummaryReport', () => {
        let consoleLogSpy;

        beforeEach(() => {
            // Mock console.log to capture output
            consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        });

        afterEach(() => {
            // Restore console.log
            consoleLogSpy.mockRestore();
        });

        const mockResults = [
            {
                job_type: "maestro",
                searchDate: "2024-10-06T10:40:00.005Z",
                collected: 0,
                inserted: 0,
                location: "Italia",
                language: "it_IT"
            },
            {
                job_type: "manager",
                searchDate: "2024-10-06T10:40:00.492Z",
                collected: 8,
                inserted: 0,
                location: "Italia",
                language: "it_IT"
            },
            {
                job_type: "notaia",
                searchDate: "2024-10-06T10:40:01.998Z",
                collected: 20,
                inserted: 4,
                location: "Italia",
                language: "it_IT"
            },
            {
                job_type: "psicologa",
                searchDate: "2024-10-06T10:40:05.915Z",
                collected: 10,
                inserted: 10,
                location: "Italia",
                language: "it_IT"
            }
        ];

        test('should print report header correctly', () => {
            RapidAPIResultsProcessor.generateSummaryReport(mockResults);

            expect(consoleLogSpy).toHaveBeenCalledWith('\n' + '='.repeat(90));
            expect(consoleLogSpy).toHaveBeenCalledWith('DATA COLLECTION SUMMARY REPORT');
            expect(consoleLogSpy).toHaveBeenCalledWith('='.repeat(90));
        });

        test('should display correct metadata', () => {
            RapidAPIResultsProcessor.generateSummaryReport(mockResults);

            expect(consoleLogSpy).toHaveBeenCalledWith('Geographic Scope: Italia');
            expect(consoleLogSpy).toHaveBeenCalledWith('Language Locale: it_IT');
            expect(consoleLogSpy).toHaveBeenCalledWith('Categories Analyzed: 4');
        });

        test('should calculate and display correct totals', () => {
            RapidAPIResultsProcessor.generateSummaryReport(mockResults);

            // Total collected: 0 + 8 + 20 + 10 = 38
            // Total inserted: 0 + 0 + 4 + 10 = 14
            // Efficiency: 14/38 = 36.84%

            expect(consoleLogSpy).toHaveBeenCalledWith('Total Records Collected: 38');
            expect(consoleLogSpy).toHaveBeenCalledWith('Total Records Processed: 14');
            expect(consoleLogSpy).toHaveBeenCalledWith('Processing Efficiency: 36.84%');
        });

        test('should display executive summary section', () => {
            RapidAPIResultsProcessor.generateSummaryReport(mockResults);

            expect(consoleLogSpy).toHaveBeenCalledWith('EXECUTIVE SUMMARY');
            expect(consoleLogSpy).toHaveBeenCalledWith('-'.repeat(90));
        });

        test('should display detailed category analysis table', () => {
            RapidAPIResultsProcessor.generateSummaryReport(mockResults);

            expect(consoleLogSpy).toHaveBeenCalledWith('DETAILED CATEGORY ANALYSIS');
            expect(consoleLogSpy).toHaveBeenCalledWith('Category          | Collected | Processed | Efficiency | Status');
        });

        test('should correctly format category rows', () => {
            RapidAPIResultsProcessor.generateSummaryReport(mockResults);

            // Test specific formatted rows
            expect(consoleLogSpy).toHaveBeenCalledWith('maestro          |         0 |         0 |       0.0% | No Data');
            expect(consoleLogSpy).toHaveBeenCalledWith('manager          |         8 |         0 |       0.0% | Review Req.');
            expect(consoleLogSpy).toHaveBeenCalledWith('notaia           |        20 |         4 |      20.0% | Partial');
            expect(consoleLogSpy).toHaveBeenCalledWith('psicologa        |        10 |        10 |     100.0% | Complete');
        });

        test('should handle empty results array', () => {
            const emptyResults = [];

            RapidAPIResultsProcessor.generateSummaryReport(emptyResults);

            expect(consoleLogSpy).toHaveBeenCalledWith('Geographic Scope: N/A');
            expect(consoleLogSpy).toHaveBeenCalledWith('Language Locale: N/A');
            expect(consoleLogSpy).toHaveBeenCalledWith('Categories Analyzed: 0');
            expect(consoleLogSpy).toHaveBeenCalledWith('Total Records Collected: 0');
            expect(consoleLogSpy).toHaveBeenCalledWith('Total Records Processed: 0');
        });

        test('should handle zero collected records correctly', () => {
            const zeroCollectedResults = [
                {
                    job_type: "test",
                    collected: 0,
                    inserted: 0,
                    location: "Test",
                    language: "en_US"
                }
            ];

            RapidAPIResultsProcessor.generateSummaryReport(zeroCollectedResults);

            expect(consoleLogSpy).toHaveBeenCalledWith('Processing Efficiency: 0.00%');
            expect(consoleLogSpy).toHaveBeenCalledWith('test             |         0 |         0 |       0.0% | No Data');
        });

        test('should display data quality score', () => {
            // Mock the calculateDataQualityScore method
            const originalCalculateDataQualityScore = RapidAPIResultsProcessor.calculateDataQualityScore;
            RapidAPIResultsProcessor.calculateDataQualityScore = jest.fn().mockReturnValue(7.5);

            RapidAPIResultsProcessor.generateSummaryReport(mockResults);

            expect(consoleLogSpy).toHaveBeenCalledWith('Data Quality Score: 7.50/10.00');

            // Restore original method
            RapidAPIResultsProcessor.calculateDataQualityScore = originalCalculateDataQualityScore;
        });

        test('should call console.log with timestamp', () => {
            const dateSpy = jest.spyOn(Date.prototype, 'toISOString').mockReturnValue('2024-10-06T10:40:00.000Z');

            RapidAPIResultsProcessor.generateSummaryReport(mockResults);

            expect(consoleLogSpy).toHaveBeenCalledWith('Report Generated: 2024-10-06T10:40:00.000Z');

            dateSpy.mockRestore();
        });

        test('should determine correct status indicators', () => {
            const statusTestResults = [
                { job_type: "no_data", collected: 0, inserted: 0, location: "Test", language: "en" },
                { job_type: "review_req", collected: 5, inserted: 0, location: "Test", language: "en" },
                { job_type: "partial", collected: 10, inserted: 3, location: "Test", language: "en" },
                { job_type: "complete", collected: 8, inserted: 8, location: "Test", language: "en" }
            ];

            RapidAPIResultsProcessor.generateSummaryReport(statusTestResults);

            expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('| No Data'));
            expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('| Review Req.'));
            expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('| Partial'));
            expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('| Complete'));
        });

    });
});