const JSearchConverter = require("../../src/DataCollector/Converters/JSearchConverter");
const JSearchRequestSender = require("../../src/DataCollector/RequestSenders/JSearchRequestSender");
const LanguageUtils = require("../../src/DataCollector/Utils/LanguageUtils");

describe("JSearchConverter Unit Tests:", () => {
    const mockJob = {
        job_id: "GR05eWisOz88AYczAAAAAA==",
        job_title: "Ingegnere di Sistema",
        employer_name: "Randstad Enterprise Italia",
        employer_logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR0a93fJuadDuOrNizDEiwYWicFMTYGVy0noAoo&s=0",
        employer_website: "http://www.randstad.com/",
        job_publisher: "LinkedIn",
        job_employment_type: "Full-time",
        job_employment_types: ["FULLTIME"],
        job_description: "We are seeking a talented Senior Software Engineer to join our dynamic team. The ideal candidate will have experience in full-stack development, strong problem-solving skills, and a passion for creating innovative solutions. Responsibilities include designing and developing scalable web applications, collaborating with cross-functional teams, and mentoring junior developers.",
        job_location: "La Spezia SP",
        job_city: "La Spezia",
        job_state: "Provincia della Spezia",
        job_country: "IT",
        job_google_link: "https://www.google.com/search?q=jobs&gl=it&hl=it&udm=8#vhid=vt%3D20/docid%3DGR05eWisOz88AYczAAAAAA%3D%3D&vssid=jobs-detail-viewer",
        job_is_remote: false,
        job_posted_at: "1 giorno fa"
    };

    const mockLanguage = "it_IT";
    const mockJobType = "Software Engineer";
    const mockICULocale = "it-IT";

    beforeEach(() => {
        jest.spyOn(LanguageUtils, 'convertRapidAPILanguageTagToICULocale')
            .mockReturnValue(mockICULocale);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe("convert method", () => {
        it("should convert complete job object correctly", () => {
            const result = JSearchConverter.convert(mockJob, mockJobType, mockLanguage);

            expect(result).toEqual({
                job_type: mockJobType,
                title: mockJob.job_title,
                company: mockJob.employer_name,
                location: mockJob.job_location,
                text: mockJob.job_description,
                employment_type: mockJob.job_employment_type,
                links: [{
                    source: 'Google Jobs',
                    url: mockJob.job_google_link
                }],
                author: JSearchRequestSender.DATA_PROVIDER,
                data_provider: JSearchRequestSender.DATA_PROVIDER,
                icu_locale_language_tag: mockICULocale
            });

            expect(LanguageUtils.convertRapidAPILanguageTagToICULocale)
                .toHaveBeenCalledWith(mockLanguage);
        });

        it("should handle missing optional job fields with empty strings", () => {
            const incompleteJob = {
                job_id: "1234567"
            };

            const result = JSearchConverter.convert(incompleteJob, mockJobType, mockLanguage);

            expect(result.title).toBe('');
            expect(result.company).toBe('');
            expect(result.location).toBe('unknown');
            expect(result.text).toBe('');
            expect(result.employment_type).toBe('');
            expect(result.job_type).toBe(mockJobType);
            expect(result.links).toEqual([]);
        });

        it("should handle job with null/undefined fields", () => {
            const jobWithNulls = {
                job_id: "test123",
                job_title: null,
                employer_name: undefined,
                job_description: null,
                job_employment_type: undefined,
                job_location: null
            };

            const result = JSearchConverter.convert(jobWithNulls, mockJobType, mockLanguage);

            expect(result.title).toBe('');
            expect(result.company).toBe('');
            expect(result.location).toBe('unknown');
            expect(result.text).toBe('');
            expect(result.employment_type).toBe('');
        });

        it("should handle job with empty string fields", () => {
            const jobWithEmptyStrings = {
                job_id: "test456",
                job_title: "",
                employer_name: "",
                job_description: "",
                job_employment_type: "",
                job_location: ""
            };

            const result = JSearchConverter.convert(jobWithEmptyStrings, mockJobType, mockLanguage);

            expect(result.title).toBe('');
            expect(result.company).toBe('');
            expect(result.location).toBe('unknown');
            expect(result.text).toBe('');
            expect(result.employment_type).toBe('');
        });

        it("should throw error when job_type is not a string", () => {
            expect(() => {
                JSearchConverter.convert(mockJob, 123, mockLanguage);
            }).toThrow("job_type must be a string!");

            expect(() => {
                JSearchConverter.convert(mockJob, null, mockLanguage);
            }).toThrow("job_type must be a string!");

            expect(() => {
                JSearchConverter.convert(mockJob, undefined, mockLanguage);
            }).toThrow("job_type must be a string!");

            expect(() => {
                JSearchConverter.convert(mockJob, [], mockLanguage);
            }).toThrow("job_type must be a string!");
        });

        it("should set correct data_provider and author fields", () => {
            const result = JSearchConverter.convert(mockJob, mockJobType, mockLanguage);

            expect(result.data_provider).toBe(JSearchRequestSender.DATA_PROVIDER);
            expect(result.author).toBe(JSearchRequestSender.DATA_PROVIDER);
        });

        it("should convert different language tags correctly", () => {
            const languages = ['it_IT', 'fr_FR', 'de_DE', 'es_ES'];
            const expectedLocales = ['it-IT', 'fr-FR', 'de-DE', 'es-ES'];

            languages.forEach((lang, index) => {
                LanguageUtils.convertRapidAPILanguageTagToICULocale
                    .mockReturnValueOnce(expectedLocales[index]);

                const result = JSearchConverter.convert(mockJob, mockJobType, lang);

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
                    job_employment_type: empType
                };

                const result = JSearchConverter.convert(jobWithEmpType, mockJobType, mockLanguage);

                expect(result.employment_type).toBe(empType);
            });
        });
    });

    describe("formatLocation method", () => {
        it("should return job_location when available", () => {
            const job = {
                job_location: "New York, NY"
            };

            const result = JSearchConverter.formatLocation(job);

            expect(result).toBe("New York, NY");
        });

        it("should return 'unknown' when job_location is not available", () => {
            const job = {};

            const result = JSearchConverter.formatLocation(job);

            expect(result).toBe('unknown');
        });

        it("should return 'unknown' when job_location is null", () => {
            const job = {
                job_location: null
            };

            const result = JSearchConverter.formatLocation(job);

            expect(result).toBe('unknown');
        });

        it("should return 'unknown' when job_location is undefined", () => {
            const job = {
                job_location: undefined
            };

            const result = JSearchConverter.formatLocation(job);

            expect(result).toBe('unknown');
        });

        it("should return unknown when job_location is empty string", () => {
            const job = {
                job_location: ""
            };

            const result = JSearchConverter.formatLocation(job);

            expect(result).toBe('unknown');
        });

        it("should handle job_location with whitespace", () => {
            const job = {
                job_location: "  San Francisco, CA  "
            };

            const result = JSearchConverter.formatLocation(job);

            expect(result).toBe("  San Francisco, CA  ");
        });
    });

    describe("buildLinksObject method", () => {
        it("should build links object with Google Jobs link when available", () => {
            const job = {
                job_google_link: "https://www.google.com/search?q=jobs&gl=it&hl=it&udm=8#vhid=vt%3D20/docid%3DGR05eWisOz88AYczAAAAAA%3D%3D&vssid=jobs-detail-viewer"
            };

            const result = JSearchConverter.buildLinksObject(job);

            expect(result).toEqual([{
                source: 'Google Jobs',
                url: job.job_google_link
            }]);
        });

        it("should return empty array when job_google_link is not available", () => {
            const job = {};

            const result = JSearchConverter.buildLinksObject(job);

            expect(result).toEqual([]);
        });

        it("should return empty array when job_google_link is null", () => {
            const job = {
                job_google_link: null
            };

            const result = JSearchConverter.buildLinksObject(job);

            expect(result).toEqual([]);
        });

        it("should return empty array when job_google_link is undefined", () => {
            const job = {
                job_google_link: undefined
            };

            const result = JSearchConverter.buildLinksObject(job);

            expect(result).toEqual([]);
        });

        it("should return empty array when job_google_link is empty string", () => {
            const job = {
                job_google_link: ""
            };

            const result = JSearchConverter.buildLinksObject(job);

            expect(result).toEqual([]);
        });

        it("should handle null job object", () => {
            const result = JSearchConverter.buildLinksObject(null);

            expect(result).toEqual([]);
        });

        it("should always return array", () => {
            const job = {
                job_google_link: "https://www.google.com/search?q=test"
            };

            const result = JSearchConverter.buildLinksObject(job);

            expect(Array.isArray(result)).toBe(true);
        });

        it("should return array with single link when job_google_link is present", () => {
            const job = {
                job_google_link: "https://www.google.com/search?q=jobs"
            };

            const result = JSearchConverter.buildLinksObject(job);

            expect(result).toHaveLength(1);
            expect(result[0]).toHaveProperty('source', 'Google Jobs');
            expect(result[0]).toHaveProperty('url', job.job_google_link);
        });
    });

    describe("JobPost schema compliance", () => {
        it("should return object with all required JobPost schema fields", () => {
            const result = JSearchConverter.convert(mockJob, mockJobType, mockLanguage);

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
            const result = JSearchConverter.convert(mockJob, mockJobType, mockLanguage);

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
            const result = JSearchConverter.convert(mockJob, mockJobType, mockLanguage);

            expect(Array.isArray(result.links)).toBe(true);
        });

        it("should ensure links array contains objects with correct structure", () => {
            const result = JSearchConverter.convert(mockJob, mockJobType, mockLanguage);

            result.links.forEach(link => {
                expect(link).toHaveProperty('source');
                expect(link).toHaveProperty('url');
                expect(typeof link.source).toBe('string');
            });
        });
    });

    describe("Real JSearch API payload compatibility", () => {
        it("should handle typical JSearch API response structure", () => {
            const jsearchApiJob = {
                job_id: "GR05eWisOz88AYczAAAAAA==",
                job_title: "Software Engineer",
                employer_name: "Tech Company Ltd",
                employer_logo: "https://logo.example.com/logo.png",
                employer_website: "http://www.techcompany.com/",
                job_publisher: "LinkedIn",
                job_employment_type: "Full-time",
                job_employment_types: ["FULLTIME"],
                job_description: "We are looking for a skilled Software Engineer to join our team...",
                job_location: "New York, NY",
                job_city: "New York",
                job_state: "New York",
                job_country: "US",
                job_google_link: "https://www.google.com/search?q=jobs&gl=us&hl=en",
                job_is_remote: false,
                job_posted_at: "2 days ago"
            };

            const result = JSearchConverter.convert(jsearchApiJob, "Software Engineer", "en_US");

            expect(result.job_type).toBe("Software Engineer");
            expect(result.title).toBe(jsearchApiJob.job_title);
            expect(result.company).toBe(jsearchApiJob.employer_name);
            expect(result.location).toBe(jsearchApiJob.job_location);
            expect(result.text).toBe(jsearchApiJob.job_description);
            expect(result.employment_type).toBe(jsearchApiJob.job_employment_type);
            expect(result.links[0].url).toBe(jsearchApiJob.job_google_link);
            expect(result.links[0].source).toBe('Google Jobs');
            expect(result.data_provider).toBe("JSearch");
        });

        it("should handle minimal JSearch API response", () => {
            const minimalJsearchJob = {
                job_id: "minimal_12345"
            };

            const result = JSearchConverter.convert(minimalJsearchJob, "Developer", "en_US");

            expect(result.job_type).toBe("Developer");
            expect(result.title).toBe('');
            expect(result.company).toBe('');
            expect(result.location).toBe('unknown');
            expect(result.text).toBe('');
            expect(result.employment_type).toBe('');
            expect(result.links).toEqual([]);
            expect(result.data_provider).toBe("JSearch");
        });

        it("should handle JSearch API response with missing Google link", () => {
            const jobWithoutGoogleLink = {
                job_id: "no_google_link_123",
                job_title: "Developer",
                employer_name: "Company ABC",
                job_description: "A great opportunity...",
                job_location: "Remote",
                job_employment_type: "Contract"
            };

            const result = JSearchConverter.convert(jobWithoutGoogleLink, "Developer", "en_US");

            expect(result.title).toBe(jobWithoutGoogleLink.job_title);
            expect(result.company).toBe(jobWithoutGoogleLink.employer_name);
            expect(result.location).toBe(jobWithoutGoogleLink.job_location);
            expect(result.text).toBe(jobWithoutGoogleLink.job_description);
            expect(result.employment_type).toBe(jobWithoutGoogleLink.job_employment_type);
            expect(result.links).toEqual([]);
        });

        it("should handle various employment types from JSearch API", () => {
            const employmentTypes = ['FULLTIME', 'PARTTIME', 'CONTRACTOR', 'INTERN'];

            employmentTypes.forEach(empType => {
                const job = {
                    job_id: "emp_type_test",
                    job_employment_type: empType
                };

                const result = JSearchConverter.convert(job, "Developer", "en_US");
                expect(result.employment_type).toBe(empType);
            });
        });
    });

    describe("Integration with JSearchRequestSender constants", () => {
        it("should use correct DATA_PROVIDER constant", () => {
            const result = JSearchConverter.convert(mockJob, mockJobType, mockLanguage);

            expect(result.author).toBe(JSearchRequestSender.DATA_PROVIDER);
            expect(result.data_provider).toBe(JSearchRequestSender.DATA_PROVIDER);
        });

        it("should use 'Google Jobs' as link source instead of DATA_PROVIDER", () => {
            const jobWithGoogleLink = {
                ...mockJob,
                job_google_link: "https://www.google.com/search?q=test"
            };

            const result = JSearchConverter.convert(jobWithGoogleLink, mockJobType, mockLanguage);

            expect(result.links[0].source).toBe('Google Jobs');
            expect(result.links[0].source).not.toBe(JSearchRequestSender.DATA_PROVIDER);
        });
    });

    describe("Edge cases and error handling", () => {
        it("should handle job object with only job_id", () => {
            const minimalJob = {
                job_id: "only_id_123"
            };

            const result = JSearchConverter.convert(minimalJob, mockJobType, mockLanguage);

            expect(result.job_type).toBe(mockJobType);
            expect(result.title).toBe('');
            expect(result.company).toBe('');
            expect(result.location).toBe('unknown');
            expect(result.text).toBe('');
            expect(result.employment_type).toBe('');
            expect(result.links).toEqual([]);
            expect(result.author).toBe(JSearchRequestSender.DATA_PROVIDER);
            expect(result.data_provider).toBe(JSearchRequestSender.DATA_PROVIDER);
            expect(result.icu_locale_language_tag).toBe(mockICULocale);
        });

        it("should handle very long job descriptions", () => {
            const longDescription = "A".repeat(10000);
            const jobWithLongDesc = {
                ...mockJob,
                job_description: longDescription
            };

            const result = JSearchConverter.convert(jobWithLongDesc, mockJobType, mockLanguage);

            expect(result.text).toBe(longDescription);
            expect(result.text.length).toBe(10000);
        });

        it("should handle special characters in job fields", () => {
            const jobWithSpecialChars = {
                job_id: "special_chars_123",
                job_title: "Software Engineer & Data Scientist 🚀",
                employer_name: "Tech Co. (Acquired by MegaCorp™)",
                job_description: "Looking for: C++ / Python developer with 5+ years exp. Salary: $100K-150K",
                job_location: "San José, CA (Remote OK)",
                job_employment_type: "Full-time/Hybrid"
            };

            const result = JSearchConverter.convert(jobWithSpecialChars, mockJobType, mockLanguage);

            expect(result.title).toBe(jobWithSpecialChars.job_title);
            expect(result.company).toBe(jobWithSpecialChars.employer_name);
            expect(result.text).toBe(jobWithSpecialChars.job_description);
            expect(result.location).toBe(jobWithSpecialChars.job_location);
            expect(result.employment_type).toBe(jobWithSpecialChars.job_employment_type);
        });
    });
});