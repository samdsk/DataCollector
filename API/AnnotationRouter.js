const express = require("express");
const {
    searchAnnotation,
    getAnnotation,
    createAnnotation,
    updateAnnotation,
    deleteAnnotation,
    addAnnotationToken,
    deleteAnnotationToken
} = require("../Controllers/AnnotationController");
const router = express.Router();

router.get("/search", searchAnnotation);
router.get("/get", getAnnotation);
router.post("/", createAnnotation);
router.put("/", updateAnnotation);
router.delete("/", deleteAnnotation);

router.put("/token", addAnnotationToken);
router.delete("/token", deleteAnnotationToken);

module.exports = router;
