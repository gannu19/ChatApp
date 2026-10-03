const Message = require('../models/Message');
const User = require('../models/User');
const Chat = require('../models/Chat');

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    return res.status(400).json({ message: 'Content and chatId are required' });
  }

  const newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
    readBy: [req.user._id],
  };

  try {
    let message = await Message.create(newMessage);

    message = await message.populate('sender', 'name avatar email username');
    message = await message.populate('chat');
    message = await User.populate(message, {
      path: 'chat.users',
      select: 'name avatar email username isOnline',
    });

    // Update the latestMessage on the Chat
    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: message._id,
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all messages for a chat with pagination
// @route   GET /api/messages/:chatId
// @access  Private
const allMessages = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip = (page - 1) * limit;

  try {
    // Utilize compound index { chat: 1, createdAt: -1 }
    const messages = await Message.find({ chat: req.params.chatId })
      .populate('sender', 'name avatar email username')
      .populate('chat')
      .sort({ createdAt: 1 }) // Return in chronological order for easy feed rendering
      .skip(skip)
      .limit(limit);

    const totalMessages = await Message.countDocuments({ chat: req.params.chatId });

    res.json({
      messages,
      page,
      pages: Math.ceil(totalMessages / limit),
      totalMessages,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Mark message as read
// @route   PUT /api/messages/:messageId/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.messageId,
      { $addToSet: { readBy: req.user._id } },
      { new: true }
    );
    res.json(message);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { sendMessage, allMessages, markAsRead };
