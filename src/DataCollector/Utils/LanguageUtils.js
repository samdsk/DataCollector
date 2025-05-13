const locales = require("locale-codes");

const validate = (tag) => {
    const res = locales.getByTag(tag);
    if (!res) return false;

    return res.tag.toLowerCase() === tag.toLowerCase();
};

const convertRapidAPILanguageTagToICULocale = (tag) => {
    const res = tag.replace("_", "-");
    if (!validate(res)) throw new Error(`Invalid ICU locale tag: ${tag}`);
    return res;
};

const convertICULocaleLanguageTagToRapidAPI = (tag) => {
    if (!validate(tag)) throw new Error(`Invalid ICU locale tag: ${tag}`);
    return tag.replace("-", "_");
};

const getLanguageNameByTag = (tag) => {
    if (!validate(tag)) throw new Error(`Invalid ICU locale tag: ${tag}`);
    const res = locales.getByTag(tag);
    if (res.location) return `${res.name} (${res.location})`;
    return `${res.name}`;
};

module.exports = {
    validate,
    convertRapidAPILanguageTagToICULocale,
    convertICULocaleLanguageTagToRapidAPI,
    getLanguageNameByTag,
};
