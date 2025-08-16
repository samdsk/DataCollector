const {logResultsToJSONFile} = require("../Loggers/ResultsLogger");
const Logger = require("../Loggers/CollectorLogger");

class RapidAPIResultsProcessor {
    static async process(results) {
        Logger.info("Logging results summary");
        await logResultsToJSONFile("summary", new Date(Date.now()), results);
        this.generateSummaryReport(results);
    }

    static generateSummaryReport(results) {
        console.log('\n' + '='.repeat(90));
        console.log('DATA COLLECTION SUMMARY REPORT');
        console.log('='.repeat(90));

        // Extract metadata
        const timestamp = new Date().toISOString();
        const location = results[0]?.location || 'N/A';
        const language = results[0]?.language || 'N/A';

        // Calculate metrics
        const totalCollected = results.reduce((sum, item) => sum + item.collected, 0);
        const totalInserted = results.reduce((sum, item) => sum + item.inserted, 0);
        const totalCategories = results.length;
        const insertionRate = totalCollected > 0 ? (totalInserted / totalCollected) : 0;

        // Header Information
        console.log(`Report Generated: ${timestamp}`);
        console.log(`Geographic Scope: ${location}`);
        console.log(`Language Locale: ${language}`);
        console.log(`Categories Analyzed: ${totalCategories}`);
        console.log('');

        // Executive Summary
        console.log('EXECUTIVE SUMMARY');
        console.log('-'.repeat(90));
        console.log(`Total Records Collected: ${totalCollected.toLocaleString()}`);
        console.log(`Total Records Processed: ${totalInserted.toLocaleString()}`);
        console.log(`Processing Efficiency: ${(insertionRate * 100).toFixed(2)}%`);
        console.log(`Data Quality Score: ${this.calculateDataQualityScore(results).toFixed(2)}/10.00`);
        console.log('');

        // Detailed Analysis
        console.log('DETAILED CATEGORY ANALYSIS');
        console.log('-'.repeat(90));
        console.log('Category          | Collected | Processed | Efficiency | Status');
        console.log('-'.repeat(90));

        results.forEach(item => {
            const category = item.job_type.padEnd(16);
            const collected = item.collected.toString().padStart(9);
            const processed = item.inserted.toString().padStart(9);
            const efficiency = item.collected > 0 ?
                ((item.inserted / item.collected) * 100).toFixed(1) + '%' : '0.0%';
            const efficiencyFormatted = efficiency.padStart(10);

            // Status indicator
            let status = 'No Data';
            if (item.collected > 0 && item.inserted === 0) status = 'Review Req.';
            else if (item.inserted > 0 && item.inserted < item.collected) status = 'Partial';
            else if (item.inserted === item.collected && item.collected > 0) status = 'Complete';

            console.log(`${category} | ${collected} | ${processed} | ${efficiencyFormatted} | ${status}`);
        });

        console.log('-'.repeat(90));
    }

    static calculateDataQualityScore(results) {
        // Academic scoring algorithm based on multiple factors
        const totalCategories = results.length;
        const categoriesWithData = results.filter(r => r.collected > 0).length;
        const totalCollected = results.reduce((sum, item) => sum + item.collected, 0);
        const totalInserted = results.reduce((sum, item) => sum + item.inserted, 0);

        // Coverage score (0-4 points)
        const coverageScore = (categoriesWithData / totalCategories) * 4;

        // Efficiency score (0-4 points)
        const efficiencyScore = totalCollected > 0 ? (totalInserted / totalCollected) * 4 : 0;

        // Volume score (0-2 points) - logarithmic scale
        const volumeScore = Math.min(2, Math.log10(totalCollected + 1) / 2);

        return coverageScore + efficiencyScore + volumeScore;
    }
}

module.exports = RapidAPIResultsProcessor;