const LanguageUtils = require("../src/DataCollector/Utils/LanguageUtils");

describe("Language Tag Checker", () => {
    const valid_lang_codes = ["it", "en", "de", "si"];
    test.each(valid_lang_codes)("Valid Language %p", (lang_code) => {
        const res = LanguageUtils.validate(lang_code);
        expect(res).toBeTruthy();
    });

    const valid_lang_tags_with_region = [
        "it-it",
        "en-gb",
        "de-at",
        "it-CH",
        "si-LK",
    ];
    test.each(valid_lang_tags_with_region)(
        "Valid Language tag with region %p",
        (lang_code) => {
            const res = LanguageUtils.validate(lang_code);
            expect(res).toBeTruthy();
        }
    );

    const invalid_lang_codes = [
        "ciao",
        "zz",
        "za",
        "bb",
        "us",
        "gb",
        "it-ZZ",
        "it-GB",
        "zz-ZZ",
        "en-UK",
        "en_IT",
        "it_IT",
        "it_it",
    ];
    test.each(invalid_lang_codes)("Invalid Language %p", (lang_code) => {
        const res = LanguageUtils.validate(lang_code);
        expect(res).toBeFalsy();
    });

    const rapidAPILangTags = [
        ["it_IT", "it-IT"],
        ["en_GB", "en-GB"],
    ];
    test.each(rapidAPILangTags)(
        "Convert to ICU Locale input: %p  expected: %p",
        (lang_code, expected) => {
            const res =
                LanguageUtils.convertRapidAPILanguageTagToICULocale(lang_code);
            expect(res).toEqual(expected);
        }
    );
    const InvalidRapidAPILangTags = ["ww_WW", "it_US"];
    test.each(InvalidRapidAPILangTags)(
        "Invalid Rapid Api Lang tag convert %p",
        (lang_code) => {
            expect(() =>
                LanguageUtils.convertRapidAPILanguageTagToICULocale(lang_code)
            ).toThrow(`Invalid ICU locale tag: ${lang_code}`);
        }
    );
    const InvalidICULocaleLangTags = ["ww_WW", "it_US"];
    test.each(InvalidICULocaleLangTags)(
        "Invalid ICU Locale convert %p",
        (lang_code) => {
            expect(() =>
                LanguageUtils.convertICULocaleLanguageTagToRapidAPI(lang_code)
            ).toThrow(`Invalid ICU locale tag: ${lang_code}`);
        }
    );

    const icuLocaleLangTags = [
        ["it-IT", "it_IT"],
        ["en-GB", "en_GB"],
    ];

    test.each(icuLocaleLangTags)(
        "Convert to RapidAPI input: %p  expected: %p",
        (lang_code, expected) => {
            const res =
                LanguageUtils.convertICULocaleLanguageTagToRapidAPI(lang_code);
            expect(res).toEqual(expected);
        }
    );

    const lang_tags = [
        ["it", "Italian"],
        ["en", "English"],
        ["de", "German"],
        ["si", "Sinhala"],
        ["it-it", "Italian (Italy)"],
        ["en-gb", "English (United Kingdom)"],
        ["de-at", "German (Austria)"],
        ["it-CH", "Italian (Switzerland)"],
        ["si-LK", "Sinhala (Sri Lanka)"],
    ];

    test.each(lang_tags)(
        "Get Name of the language from language tag input: %p  expected: %p",
        (lang_code, expected) => {
            const res = LanguageUtils.getLanguageNameByTag(lang_code);
            expect(res).toEqual(expected);
        }
    );
});
