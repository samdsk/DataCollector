const RapidAPIRequestSender_v02 = require("../RequestSenders/RapidAPIRequestSender_v02");
const LanguageUtils = require("../LanguageUtils");

class RapidAPIConverter {
    static convert(job, job_type, language) {
        if (typeof job_type !== "string")
            throw new Error("job_type must be a string!");

        const icu_locale =
            LanguageUtils.convertRapidAPILanguageTagToICULocale(language);

        const links = RapidAPIConverter.buildLinksObject(job);

        return {
            job_type: job_type,
            title: job.title,
            company: job.company,
            location: job.location,
            text: job.description,
            employment_type: job.employmentType,
            links: links,
            author: RapidAPIRequestSender_v02.DATA_PROVIDER,
            data_provider: RapidAPIRequestSender_v02.DATA_PROVIDER,
            icu_locale_language_tag: icu_locale,
        };
    }

    static buildLinksObject(job) {
        const links = [];
        const set = new Set();

        for (const jobProvider of job.jobProviders) {
            if (!set.has(jobProvider.jobProvider))
                links.push({source: jobProvider.jobProvider, url: jobProvider.url});

            set.add(jobProvider.jobProvider);
        }
        return links;
    }
}

module.exports = RapidAPIConverter;
