const express = require('express');
const router = express.Router();
const academicController = require('../controllers/academicController');
const { ensureAuth } = require('../middleware/authMiddleware');

// Academics Hub (Explain Concepts & Concept Gaps)
router.get('/explain', ensureAuth, academicController.getAcademicsHub);
router.post('/gaps', ensureAuth, academicController.postConceptGap);
router.post('/gaps/update', ensureAuth, academicController.postUpdateGapStatus);

// Lab to Life Translator
router.get('/labs', ensureAuth, academicController.getLabsTranslator);

// Project Scope Builder
router.get('/project-builder', ensureAuth, academicController.getProjectBuilder);
router.post('/project-builder', ensureAuth, academicController.postProjectScope);
router.post('/project-builder/:id/delete', ensureAuth, academicController.deleteProjectScope);

module.exports = router;
