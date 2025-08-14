const AdzunaRequestSender = require("../RequestSenders/AdzunaRequestSender");
const LanguageUtils = require("../Utils/LanguageUtils");

class AdzunaConverter {
    static convert(job, job_type, language) {
        if (typeof job_type !== "string")
            throw new Error("job_type must be a string!");

        const icu_locale =
            LanguageUtils.convertRapidAPILanguageTagToICULocale(language);

        const links = AdzunaConverter.buildLinksObject(job);

        return {
            job_type: job_type,
            title: job.title || '',
            company: job.company?.display_name || '',
            location: job.location?.display_name || '',
            text: job.description || '',
            employment_type: job.employmentType || '',
            links: links,
            author: AdzunaRequestSender.DATA_PROVIDER,
            data_provider: AdzunaRequestSender.DATA_PROVIDER,
            icu_locale_language_tag: icu_locale,
        };
    }

    static buildLinksObject(job) {
        const links = [];
        links.push({source: AdzunaRequestSender.DATA_PROVIDER, url: job?.redirect_url});
        return links;
    }
}

module.exports = AdzunaConverter;
