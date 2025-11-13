const express = require('express');
const { register, login, getMe, getAllUsers, updateUserRole, deleteUser, getUserStats } = require('../../controllers/authController');
const { auth, authorize } = require('../../middleware/auth');

const router = express.Router();

// ... existing code ...

router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, getMe);

// Admin-only routes
router.get('/users', auth, authorize('admin'), getAllUsers);
router.put('/users/:userId/role', auth, authorize('admin'), updateUserRole);
router.delete('/users/:userId', auth, authorize('admin'), deleteUser);
router.get('/stats', auth, authorize('admin'), getUserStats);

module.exports = router;
