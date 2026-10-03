const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_jwt_key_elevate_labs_2026', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, username, email, password, avatar, bio } = req.body;

  if (!name || !username || !email || !password) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  // Check if user already exists
  const userExists = await User.findOne({
    $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
  });

  if (userExists) {
    return res.status(400).json({
      message: userExists.email === email.toLowerCase()
        ? 'User with this email already exists'
        : 'Username is already taken',
    });
  }

  // Pick random avatar if none supplied
  const defaultAvatar = avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`;

  const user = await User.create({
    name,
    username: username.toLowerCase(),
    email: email.toLowerCase(),
    password,
    avatar: defaultAvatar,
    bio: bio || 'Hey there! I am using ChatApp.',
    isOnline: true,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      isOnline: user.isOnline,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ message: 'Invalid user data received' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
  const { loginId, password } = req.body; // loginId can be email or username

  if (!loginId || !password) {
    return res.status(400).json({ message: 'Please provide username/email and password' });
  }

  const user = await User.findOne({
    $or: [{ email: loginId.toLowerCase() }, { username: loginId.toLowerCase() }],
  });

  if (user && (await user.matchPassword(password))) {
    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      isOnline: user.isOnline,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: 'Invalid email/username or password' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

module.exports = { registerUser, authUser, getMe, generateToken };
