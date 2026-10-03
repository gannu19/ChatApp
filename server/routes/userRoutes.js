const express = require('express');
const {
  searchUsers,
  updateProfile,
  getUserById,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').get(protect, searchUsers);
router.route('/profile').put(protect, updateProfile);
router.route('/:id').get(protect, getUserById);

module.exports = router;
