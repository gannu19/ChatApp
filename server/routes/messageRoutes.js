const express = require('express');
const {
  sendMessage,
  allMessages,
  markAsRead,
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').post(protect, sendMessage);
router.route('/:chatId').get(protect, allMessages);
router.route('/:messageId/read').put(protect, markAsRead);

module.exports = router;
