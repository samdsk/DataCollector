const Text = require("./Text");
const DocumentSchema = require("../Schemas/Document");

const Document = Text.Text.discriminator("Document", DocumentSchema);

module.exports.Document = Document;
