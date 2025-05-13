const express = require("express");
const {
    searchCollection,
    getCollection,
    createCollection,
    updateCollection,
    deleteCollection,
    addCollectionText,
    deleteCollectionText
} = require("../Controllers/CollectionController");
const router = express.Router();

router.get("/search", searchCollection);
router.get("/get", getCollection);
router.post("/", createCollection);
router.put("/", updateCollection);
router.delete("/", deleteCollection);

router.put("/text", addCollectionText);
router.delete("/text", deleteCollectionText);

module.exports = router;