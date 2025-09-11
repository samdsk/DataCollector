
const JSearchRequestSender = require("../RequestSenders/JSearchRequestSender");
const LanguageUtils = require("../Utils/LanguageUtils");

class JSearchConverter {
    static convert(job, job_type, language) {
        if (typeof job_type !== "string")
            throw new Error("job_type must be a string!");

        const icu_locale =
            LanguageUtils.convertRapidAPILanguageTagToICULocale(language);

        const links = JSearchConverter.buildLinksObject(job);

        return {
            job_type: job_type,
            title: job.job_title || '',
            company: job.employer_name || '',
            location: JSearchConverter.formatLocation(job),
            text: job.job_description || '',
            employment_type: job.job_employment_type || '',
            links: links,
            author: JSearchRequestSender.DATA_PROVIDER,
            data_provider: JSearchRequestSender.DATA_PROVIDER,
            icu_locale_language_tag: icu_locale,
        };
    }

    static formatLocation(job) {
        // Prioritize more detailed location information
        if (job.job_location) {
            return job.job_location;
        }

        return 'unknown'
    }

    static buildLinksObject(job) {
        const links = [];

        // Always use Google Jobs link as the primary source
        if (job && job.job_google_link) {
            links.push({
                source: 'Google Jobs',
                url: job.job_google_link
            });
        }

        return links;
    }

}

module.exports = JSearchConverter;