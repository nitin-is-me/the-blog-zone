const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminAuth = require('../middleware/adminAuth');

router.post('/login', adminController.adminLogin);

// Protected routes
router.use(adminAuth);
router.get('/users', adminController.getUsers);
router.put('/users/:id/ban', adminController.toggleBan);
router.delete('/users/:id', adminController.deleteUser);

router.get('/posts', adminController.getPublicPosts);
router.delete('/posts/:id', adminController.deletePost);

module.exports = router;
