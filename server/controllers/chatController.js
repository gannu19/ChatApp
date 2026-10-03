const Chat = require('../models/Chat');
const User = require('../models/User');

// @desc    Create or fetch 1-on-1 chat
// @route   POST /api/chats
// @access  Private
const accessChat = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'UserId param not sent with request' });
  }

  // Check if a 1-on-1 chat already exists between the two users
  let isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate('users', '-password')
    .populate('latestMessage');

  isChat = await User.populate(isChat, {
    path: 'latestMessage.sender',
    select: 'name avatar email username',
  });

  if (isChat.length > 0) {
    res.json(isChat[0]);
  } else {
    // Create new 1-on-1 chat
    const chatData = {
      chatName: 'sender',
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const fullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        'users',
        '-password'
      );
      res.status(201).json(fullChat);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
};

// @desc    Fetch all chats for the logged in user
// @route   GET /api/chats
// @access  Private
const fetchChats = async (req, res) => {
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate('users', '-password')
      .populate('groupAdmin', '-password')
      .populate('latestMessage')
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: 'latestMessage.sender',
          select: 'name avatar email username',
        });
        res.status(200).send(results);
      });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get chat by ID
// @route   GET /api/chats/:id
// @access  Private
const getChatById = async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.id,
      users: { $elemMatch: { $eq: req.user._id } },
    })
      .populate('users', '-password')
      .populate('groupAdmin', '-password')
      .populate('latestMessage');

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    res.json(chat);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Create new Group Chat
// @route   POST /api/chats/group
// @access  Private
const createGroupChat = async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: 'Please fill all required fields' });
  }

  let users = typeof req.body.users === 'string' ? JSON.parse(req.body.users) : req.body.users;

  if (users.length < 2) {
    return res.status(400).send({ message: 'More than 2 users are required to form a group chat' });
  }

  // Include the admin (current user) in the group
  users.push(req.user._id);

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user._id,
      groupDescription: req.body.description || 'Welcome to the group!',
      groupAvatar: req.body.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${req.body.name}`,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate('users', '-password')
      .populate('groupAdmin', '-password');

    res.status(201).json(fullGroupChat);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Rename Group
// @route   PUT /api/chats/group/:id/rename
// @access  Private
const renameGroup = async (req, res) => {
  const { name, description } = req.body;
  const { id } = req.params;

  const updateFields = {};
  if (name) updateFields.chatName = name;
  if (description !== undefined) updateFields.groupDescription = description;

  const updatedChat = await Chat.findByIdAndUpdate(id, updateFields, {
    new: true,
  })
    .populate('users', '-password')
    .populate('groupAdmin', '-password');

  if (!updatedChat) {
    res.status(404).json({ message: 'Chat Not Found' });
  } else {
    res.json(updatedChat);
  }
};

// @desc    Add member to group
// @route   PUT /api/chats/group/:id/members
// @access  Private
const addToGroup = async (req, res) => {
  const { userId } = req.body;
  const { id } = req.params;

  const chat = await Chat.findById(id);

  if (!chat) {
    return res.status(404).json({ message: 'Chat Not Found' });
  }

  // Check if user is already in group
  if (chat.users.includes(userId)) {
    return res.status(400).json({ message: 'User is already in this group' });
  }

  const added = await Chat.findByIdAndUpdate(
    id,
    { $push: { users: userId } },
    { new: true }
  )
    .populate('users', '-password')
    .populate('groupAdmin', '-password');

  res.json(added);
};

// @desc    Remove member from group
// @route   DELETE /api/chats/group/:id/members
// @access  Private
const removeFromGroup = async (req, res) => {
  const { userId } = req.body;
  const { id } = req.params;

  const chat = await Chat.findById(id);

  if (!chat) {
    return res.status(404).json({ message: 'Chat Not Found' });
  }

  // Only admin can remove others, or user can remove themselves
  if (chat.groupAdmin.toString() !== req.user._id.toString() && req.user._id.toString() !== userId) {
    return res.status(403).json({ message: 'Only admin can remove other members' });
  }

  const removed = await Chat.findByIdAndUpdate(
    id,
    { $pull: { users: userId } },
    { new: true }
  )
    .populate('users', '-password')
    .populate('groupAdmin', '-password');

  res.json(removed);
};

// @desc    Leave Group
// @route   PUT /api/chats/group/:id/leave
// @access  Private
const leaveGroup = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const chat = await Chat.findById(id);
  if (!chat) {
    return res.status(404).json({ message: 'Chat Not Found' });
  }

  // If groupAdmin leaves, reassign admin to another user if members remain
  const remainingUsers = chat.users.filter((u) => u.toString() !== userId.toString());
  let newAdmin = chat.groupAdmin;
  if (chat.groupAdmin.toString() === userId.toString() && remainingUsers.length > 0) {
    newAdmin = remainingUsers[0];
  }

  const updatedChat = await Chat.findByIdAndUpdate(
    id,
    {
      $pull: { users: userId },
      groupAdmin: newAdmin,
    },
    { new: true }
  )
    .populate('users', '-password')
    .populate('groupAdmin', '-password');

  res.json(updatedChat);
};

module.exports = {
  accessChat,
  fetchChats,
  getChatById,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
  leaveGroup,
};
