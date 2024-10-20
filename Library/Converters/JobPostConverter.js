class JobPostConverter {
    static convert(job, data_provider, icu_locale) {
        const links = JobPostConverter.buildLinksObject(job);
        return {
            _id: job._id,
            job_type: job.job_type,
            title: job.title,
            company: job.company,
            location: job.location,
            text: job.description,
            links: links,
            author: job.author,
            icu_locale_language_tag: icu_locale,
            data_provider: data_provider,
            createdAt: job.createdAt,
            updatedAt: job.updatedAt,
        };
    }

    static buildLinksObject(job) {
        const links = [];
        const set = new Set();

        for (const link of job.links) {
            if (!set.has(link.source))
                links.push({source: link.source, url: link.url});

            set.add(link.source);
        }
        return links;
    }
}

module.exports = JobPostConverter;
