const fs = require("fs");
const path = require("path");
const Logger = require("../DataCollector/Loggers/MasterProcessLogger");

function displayStartupBanner() {
    // Try to get package.json for project info
    let projectInfo = {};
    try {
        const packageJsonPath = path.resolve(process.cwd(), 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            projectInfo = require(packageJsonPath);
        }
    } catch (err) {
        // Fallback values if we can't read package.json
        projectInfo = {
            name: "Data Collector",
            version: "1.0.0",
            author: "Sam. K.",
            description: "Data Collection and Process Management System"
        };
    }

    // Box constants - IMPORTANT: These must be consistent throughout
    const outerWidth = 81; // Total width including border characters
    const innerWidth = outerWidth - 2; // Inner width (between border characters)
    const contentIndent = 2; // Spaces after the left border
    const contentWidth = innerWidth - (contentIndent * 2); // Width available for text content

    // Helper for creating full-width lines
    const createBoxLine = (content = '') => {
        const remainingSpace = Math.max(0, innerWidth - contentIndent - content.length);
        return `║${' '.repeat(contentIndent)}${content}${' '.repeat(remainingSpace)}║`;

    };

    // Helper for creating the top/bottom borders
    const topBorder = `╔${'═'.repeat(innerWidth)}╗`;
    const bottomBorder = `╚${'═'.repeat(innerWidth)}╝`;

    // Word wrap function with exact width calculation
    const wrapText = (text, maxWidth) => {
        const lines = [];
        if (!text) return lines;

        const words = text.split(' ');
        let line = '';

        for (const word of words) {
            const testLine = line ? `${line} ${word}` : word;
            if (testLine.length <= maxWidth) {
                line = testLine;
            } else {
                if (line) lines.push(line);
                line = word;
            }
        }

        if (line) lines.push(line);
        return lines;
    };

    // Wrap the description text - use a fixed value for the description width
    const labelWidth = 14; // "Description: " width including the following space
    const descMaxWidth = contentWidth - labelWidth;
    const description = projectInfo.description || '';
    const wrappedDescription = wrapText(description, descMaxWidth);

    // Log project information with consistent widths
    Logger.info(topBorder);
    Logger.info(createBoxLine(`Project:    ${projectInfo.name.padEnd(contentWidth - labelWidth)}`));
    Logger.info(createBoxLine(`Version:    ${(projectInfo.version || '1.0.0').padEnd(contentWidth - labelWidth)}`));
    Logger.info(createBoxLine(`Author:     ${(projectInfo.author || 'Your Company').padEnd(contentWidth - labelWidth)}`));

    // Log description with consistent alignment
    if (wrappedDescription.length > 0) {
        Logger.info(createBoxLine(`Description: ${wrappedDescription[0].padEnd(contentWidth - labelWidth)}`));
        for (let i = 1; i < wrappedDescription.length; i++) {
            // Align continuation lines with the start of description text
            const padding = ' '.repeat(labelWidth);
            Logger.info(createBoxLine(`${padding}${wrappedDescription[i].padEnd(contentWidth - labelWidth)}`));
        }
    }

    Logger.info(createBoxLine());
    Logger.info(createBoxLine(`Process ID:  ${process.ppid.toString().padEnd(contentWidth - labelWidth)}`));
    Logger.info(createBoxLine(`Started at:  ${new Date().toISOString().padEnd(contentWidth - labelWidth)}`));
    Logger.info(createBoxLine(`Environment: ${(process.env.NODE_ENV || 'development').padEnd(contentWidth - labelWidth)}`));
    Logger.info(bottomBorder);
}

module.exports = displayStartupBanner