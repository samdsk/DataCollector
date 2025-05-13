const DataCleaner = require("../src/Library/Utils/DataCleaning");

describe("Text filter", () => {
    const replace = " ";
    it("should filter out common punctuation", () => {
        const text = "common punctuation marks [.,:;?!\"-']";
        const res = DataCleaner.removeSpecialCharacters(text, replace);
        const expect_text = "common punctuation marks           ";
        expect(res).toBe(expect_text);
    });
    it("should filter out special symbols", () => {
        const text = "special symbols [@,#,$,%,&,*]";
        const res = DataCleaner.removeSpecialCharacters(text, replace);
        const expect_text = "special symbols              ";
        expect(res).toBe(expect_text);
    });
    it("should filter out mathematical symbols", () => {
        const text = "mathematical symbols [+,-,/,*,=,<,>]";
        const res = DataCleaner.removeSpecialCharacters(text, replace);
        const expect_text = "mathematical symbols                ";
        expect(res).toBe(expect_text);
    });
    it("should filter out parentheses and brackets", () => {
        const text = "parentheses and brackets [](){}";
        const res = DataCleaner.removeSpecialCharacters(text, replace);
        const expect_text = "parentheses and brackets       ";
        expect(res).toBe(expect_text);
    });
    it("should filter out emojis and emoticons", () => {
        const text = "emojis and emoticons 🖖,😎,:),-.-,:-),:-(";
        const res = DataCleaner.removeSpecialCharacters(text, replace);
        const expect_text = "emojis and emoticons                     ";
        expect(res).toBe(expect_text);
    });
    it("should filter out control characters", () => {
        const text = "control characters [\n,\r,\t]";
        const res = DataCleaner.removeControlCharacters(text, replace);
        const expect_text = "control characters [ , , ]";
        expect(res).toBe(expect_text);
    });

    it("should remove excess spaces", () => {
        const text = "common punctuation     marks   [.,:;?!\"'-]    ";
        const res = DataCleaner.removeExcessWhitespace(text, replace);
        const expect_text = "common punctuation marks [.,:;?!\"'-]";

        expect(res).toBe(expect_text);
    });

    it("should not remove characters with accent", () => {
        const text = "èéòàù";
        const res = DataCleaner.removeSpecialCharacters(text, replace);
        const expect_text = "èéòàù";

        expect(res).toBe(expect_text);
    });
    it("should not remove characters with accent like e' c'è perche'", () => {
        const text = "e' c'è perche'";
        const res = DataCleaner.removeSpecialCharacters(text, replace);
        const expect_text = "e' c'è perche'";

        expect(res).toBe(expect_text);
    });

    it("should remove HTML tags", () => {
        const text =
            "<p>This is <b>some</b> text <i>with</i> HTML <span>tags</span>.</p>";
        const res = DataCleaner.removeHTMLTags(text, replace);
        const expect_text = " This is  some  text  with  HTML  tags . ";

        expect(res).toBe(expect_text);
    });

    it("should clean the text with default pipeline", () => {
        const text =
            "\n• gestione c'è giù l'ho degli E' s'è sì fa' À É È Ì Ò Ù <p>ciao</p> farà quell'albero :-) 🖖 :') inventari\n\nRequisiti:\n\t\n{Automuniti\n\nDisponibilità al lavoro su turni\n\nDisponibilità a lavorare nel weekend\n\n\n\nOrario di lavoro: lavoro su 2 turni (6-14 e 14-22)\n\n";
        const expect_text =
            "gestione c'è giù l'ho degli E' s'è sì fa' À É È Ì Ò Ù ciao farà quell'albero inventari Requisiti Automuniti Disponibilità al lavoro su turni Disponibilità a lavorare nel weekend Orario di lavoro lavoro su 2 turni 6 14 e 14 22";

        const res = DataCleaner.cleanString(text, replace);

        expect(res).toBe(expect_text);
    });

    it("should clean the text with custom pipeline", () => {
        const text =
            "\n• gestione c'è giù l'ho degli E' s'è sì fa' À É È Ì Ò Ù <p>ciao</p> farà quell'albero :-) 🖖 :') inventari\n\nRequisiti:\n\t\n{Automuniti\n\nDisponibilità al lavoro su turni\n\nDisponibilità a lavorare nel weekend\n\n\n\nOrario di lavoro: lavoro su 2 turni (6-14 e 14-22)\n\n";
        const expect_text =
            "\n• gestione c'è giù l'ho degli E' s'è sì fa' À É È Ì Ò Ù  ciao  farà quell'albero :-) 🖖 :') inventari\n\nRequisiti:\n\t\n{Automuniti\n\nDisponibilità al lavoro su turni\n\nDisponibilità a lavorare nel weekend\n\n\n\nOrario di lavoro: lavoro su 2 turni (6-14 e 14-22)\n\n";

        const list = [DataCleaner.removeHTMLTags];
        const res = DataCleaner.cleanString(text, replace, list);

        expect(res).toBe(expect_text);
    });
});

describe("Normalize text", () => {
    it("all characters should be lowercase", () => {
        const text = "ABCD";
        const res = DataCleaner.textNormalize(text);
        const expect_text = "abcd";

        expect(res).toBe(expect_text);
    });
});
