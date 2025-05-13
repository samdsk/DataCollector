const express = require("express");
const OutputLLMRouter = require("./OutputLLMRouter");
const JobPostRouter = require("./JobPostRouter");
const TextRouter = require("./TextRouter");
const DataProviderRouter = require("./DataProviderRouter");
const LabelRouter = require("./LabelRouter");
const DomainRouter = require("./DomainRouter");
const BackgroundRouter = require("./BackgroundRouter");
const RoleRouter = require("./RoleRouter");
const AnnotatorRouter = require("./AnnotatorRouter");
const AnnotationRouter = require("./AnnotationRouter");
const CollectionRouter = require("./CollectionRouter");
const CollectorRouter = require("./CollectorRouter");

const {roleAuthentication, ROLES} = require("../Middlewares/Authentication");

const router = express.Router();

router.use("/OutputLLM", roleAuthentication(...ROLES.LLM), OutputLLMRouter);
router.use("/JobPost", roleAuthentication(...ROLES.AnnotationService), JobPostRouter);
router.use("/Text", roleAuthentication(...ROLES.AnnotationService), TextRouter);
router.use("/DataProvider", roleAuthentication(...ROLES.AnnotationService), DataProviderRouter);
router.use("/Label", roleAuthentication(...ROLES.AnnotationService), LabelRouter);
router.use("/Domain", roleAuthentication(...ROLES.AnnotationService), DomainRouter);
router.use("/Background", roleAuthentication(...ROLES.AnnotationService), BackgroundRouter);
router.use("/Role", roleAuthentication(...ROLES.AnnotationService), RoleRouter);
router.use("/Annotator", roleAuthentication(...ROLES.AnnotationService), AnnotatorRouter);
router.use("/Annotation", roleAuthentication(...ROLES.AnnotationService), AnnotationRouter);
router.use("/Collection", roleAuthentication(...ROLES.AnnotationService), CollectionRouter);
router.use("/Collector", roleAuthentication(...ROLES.AnnotationService), CollectorRouter);

module.exports = router;
