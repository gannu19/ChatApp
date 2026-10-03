const express = require('express');
const {
  accessChat,
  fetchChats,
  getChatById,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
  leaveGroup,
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').post(protect, accessChat).get(protect, fetchChats);
router.route('/group').post(protect, createGroupChat);
router.route('/group/:id/rename').put(protect, renameGroup);
router.route('/group/:id/members').put(protect, addToGroup).delete(protect, removeFromGroup);
router.route('/group/:id/leave').put(protect, leaveGroup);
router.route('/:id').get(protect, getChatById);

module.exports = router;
