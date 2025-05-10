/**
 * Filter special characters:
 *  common punctuation marks [.,:;?!"-]
 *  special symbols [@,#,$,%,&,*,etc]
 *  mathematical symbols [+,-,/,*,=,<,>]
 *  parentheses and brackets [](){}
 *  emojis and emoticons
 *  line breaks and whitespace
 *  control characters [\n,\r,\t]
 */

/**
 * @param {String} str requires a String
 * @returns a normalized String (lowercase)
 */

const textNormalize = (str) => {
    return str.toLowerCase();
};

/**
 * This function removes special characters from the given string and replaces removed char with a space
 * Special characters are: .,:;?!"-@#$%&*+-/*=<>\[]\()\{} and apostrophe if it's followed and preceded by space.
 *
 * @param {String} str requires a String
 * @returns a String without special characters and replace them with a space
 */
const removeSpecialCharacters = (str, replace) => {
    const re = /[^a-zA-Z0-9\s'éèùàòìÀÉÈÌÒÙ](?!\w')/g;
    const single_apostrophe = / (?=')'(?= )/g;
    return str.replace(re, replace).replace(single_apostrophe, " ");
};

/**
 * This function removes control characters from the given string and replaces removed char with a space.
 * Control characters are: ASCII characters from \x00 to \x1F and \x7F (example: \n \r \t)
 *
 * @param {String} str requires a String
 * @returns a string without control characters
 */
const removeControlCharacters = (str, replace) => {
    const re = /[\x00-\x1F\x7F]/g;
    return str.replace(re, replace);
};

/**
 * This function removes HTML tags and replaces them with a space
 * @param {String} str requires a string
 * @returns a string without HTML tags
 */
const removeHTMLTags = (str, replace) => {
    const re = /<[^>]+>/g;
    return str.replace(re, replace);
};

/**
 * This function removes redundant whitespace, replace them with a single space, finally, trims the given string
 * @param {String} str requires a String
 * @returns a string without redundant whitespace and preceding and following whitespace
 */
const removeExcessWhitespace = (str, replace = " ") => {
    const re = /\s+/g;
    return str.replace(re, replace).trim();
};

// Default list for cleaning
const DEFAULT_CLEANING_PIPELINE = [
    removeControlCharacters,
    removeHTMLTags,
    removeSpecialCharacters,
    removeExcessWhitespace,
];

/**
 *
 * @param {String} str string to clean
 * @param {String} replace character
 * @param {Array} list of cleaning functions to apply to the string, functions are applied IN ORDER,
 *                functions must respect in the following structure: "(str) => str",
 *                given a string returns a string
 * @throws an error if first parameter is not a String
 * @returns String obtained applying the given list of functions
 */
const cleanString = (str, replace, list = DEFAULT_CLEANING_PIPELINE) => {
    if (typeof str !== "string")
        throw new Error("First parameter must be a string!");

    for (let fn of list) {
        str = fn(str, replace);
    }

    return str;
};

module.exports = {
    removeSpecialCharacters,
    removeExcessWhitespace,
    removeControlCharacters,
    cleanString,
    removeHTMLTags,
    textNormalize,
};
