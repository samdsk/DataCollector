const AdzunaConverter = require("../../src/DataCollector/Converters/AdzunaConverter");
const AdzunaRequestSender = require("../../src/DataCollector/RequestSenders/AdzunaRequestSender");
const LanguageUtils = require("../../src/DataCollector/Utils/LanguageUtils");

describe("AdzunaConverter Unit Tests:", () => {
    const mockJob = {
        id: "4567890",
        title: "Senior Software Engineer",
        company: {
            display_name: "Tech Innovation Corp"
        },
        location: {
            display_name: "San Francisco, CA, USA"
        },
        description: "We are seeking a talented Senior Software Engineer to join our dynamic team. The ideal candidate will have experience in full-stack development, strong problem-solving skills, and a passion for creating innovative solutions. Responsibilities include designing and developing scalable web applications, collaborating with cross-functional teams, and mentoring junior developers.",
        redirect_url: "https://www.adzuna.com/job/4567890",
        created: "2025-08-14T09:30:00Z",
        employmentType: "Full-time"
    };

    const mockLanguage = "en_US";
    const mockJobType = "Software Engineer";
    const mockICULocale = "en-US";

    beforeEach(() => {
        jest.spyOn(LanguageUtils, 'convertRapidAPILanguageTagToICULocale')
            .mockReturnValue(mockICULocale);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe("convert method", () => {
        it("should convert complete job object correctly", () => {
            const result = AdzunaConverter.convert(mockJob, mockJobType, mockLanguage);

            expect(result).toEqual({
                job_type: mockJobType,
                title: mockJob.title,
                company: mockJob.company.display_name,
                location: mockJob.location.display_name,
                text: mockJob.description,
                employment_type: mockJob.employmentType,
                links: [{
                    source: AdzunaRequestSender.DATA_PROVIDER,
                    url: mockJob.redirect_url
                }],
                author: AdzunaRequestSender.DATA_PROVIDER,
                data_provider: AdzunaRequestSender.DATA_PROVIDER,
                icu_locale_language_tag: mockICULocale
            });

            expect(LanguageUtils.convertRapidAPILanguageTagToICULocale)
                .toHaveBeenCalledWith(mockLanguage);
        });

        it("should handle missing optional job fields with empty strings", () => {
            const incompleteJob = {
                id: "1234567",
                redirect_url: "https://www.adzuna.com/job/1234567"
            };

            const result = AdzunaConverter.convert(incompleteJob, mockJobType, mockLanguage);

            expect(result.title).toBe('');
            expect(result.company).toBe('');
            expect(result.location).toBe('');
            expect(result.text).toBe('');
            expect(result.employment_type).toBe('');
            expect(result.job_type).toBe(mockJobType);
            expect(result.links).toEqual([{
                source: AdzunaRequestSender.DATA_PROVIDER,
                url: incompleteJob.redirect_url
            }]);
        });

        it("should handle job with missing company object", () => {
            const jobWithoutCompany = {
                ...mockJob,
                company: null
            };

            const result = AdzunaConverter.convert(jobWithoutCompany, mockJobType, mockLanguage);

            expect(result.company).toBe('');
        });

        it("should handle job with missing location object", () => {
            const jobWithoutLocation = {
                ...mockJob,
                location: null
            };

            const result = AdzunaConverter.convert(jobWithoutLocation, mockJobType, mockLanguage);

            expect(result.location).toBe('');
        });

        it("should handle job with empty company display_name", () => {
            const jobWithEmptyCompany = {
                ...mockJob,
                company: {
                    display_name: ""
                }
            };

            const result = AdzunaConverter.convert(jobWithEmptyCompany, mockJobType, mockLanguage);

            expect(result.company).toBe('');
        });

        it("should handle job with empty location display_name", () => {
            const jobWithEmptyLocation = {
                ...mockJob,
                location: {
                    display_name: ""
                }
            };

            const result = AdzunaConverter.convert(jobWithEmptyLocation, mockJobType, mockLanguage);

            expect(result.location).toBe('');
        });

        it("should throw error when job_type is not a string", () => {
            expect(() => {
                AdzunaConverter.convert(mockJob, 123, mockLanguage);
            }).toThrow("job_type must be a string!");

            expect(() => {
                AdzunaConverter.convert(mockJob, null, mockLanguage);
            }).toThrow("job_type must be a string!");

            expect(() => {
                AdzunaConverter.convert(mockJob, undefined, mockLanguage);
            }).toThrow("job_type must be a string!");

            expect(() => {
                AdzunaConverter.convert(mockJob, [], mockLanguage);
            }).toThrow("job_type must be a string!");
        });

        it("should set correct data_provider and author fields", () => {
            const result = AdzunaConverter.convert(mockJob, mockJobType, mockLanguage);

            expect(result.data_provider).toBe(AdzunaRequestSender.DATA_PROVIDER);
            expect(result.author).toBe(AdzunaRequestSender.DATA_PROVIDER);
        });

        it("should convert different language tags correctly", () => {
            const languages = ['it_IT', 'fr_FR', 'de_DE', 'es_ES'];
            const expectedLocales = ['it-IT', 'fr-FR', 'de-DE', 'es-ES'];

            languages.forEach((lang, index) => {
                LanguageUtils.convertRapidAPILanguageTagToICULocale
                    .mockReturnValueOnce(expectedLocales[index]);

                const result = AdzunaConverter.convert(mockJob, mockJobType, lang);

                expect(result.icu_locale_language_tag).toBe(expectedLocales[index]);
                expect(LanguageUtils.convertRapidAPILanguageTagToICULocale)
                    .toHaveBeenCalledWith(lang);
            });
        });

        it("should handle various employment types", () => {
            const employmentTypes = ['Full-time', 'Part-time', 'Contract', 'Temporary', 'Internship'];

            employmentTypes.forEach(empType => {
                const jobWithEmpType = {
                    ...mockJob,
                    employmentType: empType
                };

                const result = AdzunaConverter.convert(jobWithEmpType, mockJobType, mockLanguage);

                expect(result.employment_type).toBe(empType);
            });
        });
    });

    describe("buildLinksObject method", () => {
        it("should build links object with correct structure", () => {
            const job = {
                redirect_url: "https://www.adzuna.com/job/12345"
            };

            const result = AdzunaConverter.buildLinksObject(job);

            expect(result).toEqual([{
                source: AdzunaRequestSender.DATA_PROVIDER,
                url: job.redirect_url
            }]);
        });

        it("should handle job without redirect_url", () => {
            const job = {};

            const result = AdzunaConverter.buildLinksObject(job);

            expect(result).toEqual([{
                source: AdzunaRequestSender.DATA_PROVIDER,
                url: undefined
            }]);
        });

        it("should handle null job object", () => {
            const result = AdzunaConverter.buildLinksObject(null);

            expect(result).toEqual([{
                source: AdzunaRequestSender.DATA_PROVIDER,
                url: undefined
            }]);
        });

        it("should always return array with single link object", () => {
            const job = {
                redirect_url: "https://www.adzuna.com/job/99999"
            };

            const result = AdzunaConverter.buildLinksObject(job);

            expect(Array.isArray(result)).toBe(true);
            expect(result).toHaveLength(1);
            expect(result[0]).toHaveProperty('source');
            expect(result[0]).toHaveProperty('url');
        });
    });

    describe("JobPost schema compliance", () => {
        it("should return object with all required JobPost schema fields", () => {
            const result = AdzunaConverter.convert(mockJob, mockJobType, mockLanguage);

            // Check all expected fields are present
            expect(result).toHaveProperty('job_type');
            expect(result).toHaveProperty('title');
            expect(result).toHaveProperty('company');
            expect(result).toHaveProperty('location');
            expect(result).toHaveProperty('text');
            expect(result).toHaveProperty('employment_type');
            expect(result).toHaveProperty('links');
            expect(result).toHaveProperty('author');
            expect(result).toHaveProperty('data_provider');
            expect(result).toHaveProperty('icu_locale_language_tag');
        });

        it("should ensure all string fields are strings", () => {
            const result = AdzunaConverter.convert(mockJob, mockJobType, mockLanguage);

            expect(typeof result.job_type).toBe('string');
            expect(typeof result.title).toBe('string');
            expect(typeof result.company).toBe('string');
            expect(typeof result.location).toBe('string');
            expect(typeof result.text).toBe('string');
            expect(typeof result.employment_type).toBe('string');
            expect(typeof result.author).toBe('string');
            expect(typeof result.data_provider).toBe('string');
            expect(typeof result.icu_locale_language_tag).toBe('string');
        });

        it("should ensure links field is array", () => {
            const result = AdzunaConverter.convert(mockJob, mockJobType, mockLanguage);

            expect(Array.isArray(result.links)).toBe(true);
        });

        it("should ensure links array contains objects with correct structure", () => {
            const result = AdzunaConverter.convert(mockJob, mockJobType, mockLanguage);

            result.links.forEach(link => {
                expect(link).toHaveProperty('source');
                expect(link).toHaveProperty('url');
                expect(typeof link.source).toBe('string');
            });
        });
    });

    describe("Real Adzuna API payload compatibility", () => {
        it("should handle typical Adzuna API response structure", () => {
            const adzunaApiJob = {
                id: "adzuna_12345",
                title: "Software Engineer",
                company: {
                    display_name: "Tech Company Ltd"
                },
                location: {
                    display_name: "New York, NY"
                },
                description: "We are looking for a skilled Software Engineer to join our team...",
                redirect_url: "https://www.adzuna.com/job/12345",
                created: "2025-08-14T10:00:00Z",
                employmentType: "Full-time"
            };

            const result = AdzunaConverter.convert(adzunaApiJob, "Software Engineer", "en_US");

            expect(result.job_type).toBe("Software Engineer");
            expect(result.title).toBe(adzunaApiJob.title);
            expect(result.company).toBe(adzunaApiJob.company.display_name);
            expect(result.location).toBe(adzunaApiJob.location.display_name);
            expect(result.text).toBe(adzunaApiJob.description);
            expect(result.employment_type).toBe(adzunaApiJob.employmentType);
            expect(result.links[0].url).toBe(adzunaApiJob.redirect_url);
            expect(result.data_provider).toBe("Adzuna");
        });

        it("should handle minimal Adzuna API response", () => {
            const minimalAdzunaJob = {
                id: "adzuna_minimal",
                redirect_url: "https://www.adzuna.com/job/minimal"
            };

            const result = AdzunaConverter.convert(minimalAdzunaJob, "Developer", "en_US");

            expect(result.job_type).toBe("Developer");
            expect(result.title).toBe('');
            expect(result.company).toBe('');
            expect(result.location).toBe('');
            expect(result.text).toBe('');
            expect(result.employment_type).toBe('');
            expect(result.links[0].url).toBe(minimalAdzunaJob.redirect_url);
            expect(result.data_provider).toBe("Adzuna");
        });
    });

    describe("Integration with AdzunaRequestSender constants", () => {
        it("should use correct DATA_PROVIDER constant", () => {
            const result = AdzunaConverter.convert(mockJob, mockJobType, mockLanguage);

            expect(result.author).toBe(AdzunaRequestSender.DATA_PROVIDER);
            expect(result.data_provider).toBe(AdzunaRequestSender.DATA_PROVIDER);
            expect(result.links[0].source).toBe(AdzunaRequestSender.DATA_PROVIDER);
        });
    });
});