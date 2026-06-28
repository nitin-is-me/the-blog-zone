const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const verifyToken = require('../middleware/authMiddleware');

router.post('/improve-text', verifyToken, aiController.improveText);
router.post('/summarize', aiController.summarizeBlog); // Publicly accessible for readers

module.exports = router;
