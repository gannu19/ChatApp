const User = require('../models/User');
const Chat = require('../models/Chat');
const Message = require('../models/Message');

const seedDemoData = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('[Seed] Database already contains data. Skipping seed.');
      return;
    }

    console.log('[Seed] Seeding initial demo users and conversations...');

    // Create 4 demo users
    const alice = await User.create({
      name: 'Alice Johnson',
      username: 'alice',
      email: 'alice@example.com',
      password: 'password123',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
      bio: '🚀 Full-stack engineer & open-source enthusiast',
      isOnline: true,
    });

    const bob = await User.create({
      name: 'Bob Smith',
      username: 'bob',
      email: 'bob@example.com',
      password: 'password123',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
      bio: '🎧 Audio engineer & cloud architect',
      isOnline: false,
    });

    const charlie = await User.create({
      name: 'Charlie Davis',
      username: 'charlie',
      email: 'charlie@example.com',
      password: 'password123',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie',
      bio: '🎨 UI/UX Designer & Frontend wizard',
      isOnline: true,
    });

    const diana = await User.create({
      name: 'Diana Prince',
      username: 'diana',
      email: 'diana@example.com',
      password: 'password123',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diana',
      bio: '⚡ Product manager @ Elevate Labs',
      isOnline: true,
    });

    // Create 1-on-1 Chat between Alice and Bob
    const directChat1 = await Chat.create({
      chatName: 'sender',
      isGroupChat: false,
      users: [alice._id, bob._id],
    });

    // Create initial messages
    const msg1 = await Message.create({
      sender: bob._id,
      content: 'Hey Alice! Have you checked out the new Socket.IO real-time features?',
      chat: directChat1._id,
      readBy: [bob._id, alice._id],
    });

    const msg2 = await Message.create({
      sender: alice._id,
      content: 'Hey Bob! Yes, instant message delivery and typing indicators are super fast! 🚀',
      chat: directChat1._id,
      readBy: [alice._id],
    });

    directChat1.latestMessage = msg2._id;
    await directChat1.save();

    // Create a Group Chat
    const groupChat = await Chat.create({
      chatName: 'Elevate Dev Team 💻',
      isGroupChat: true,
      users: [alice._id, bob._id, charlie._id, diana._id],
      groupAdmin: alice._id,
      groupDescription: 'Official engineering and product channel for Elevate Labs project',
      groupAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=ElevateDevTeam',
    });

    const groupMsg1 = await Message.create({
      sender: diana._id,
      content: 'Welcome everyone! Sprint review is scheduled for 3 PM today.',
      chat: groupChat._id,
      readBy: [diana._id, alice._id],
    });

    const groupMsg2 = await Message.create({
      sender: charlie._id,
      content: 'All UI components for one-to-one and group messaging are live!',
      chat: groupChat._id,
      readBy: [charlie._id, alice._id],
    });

    groupChat.latestMessage = groupMsg2._id;
    await groupChat.save();

    console.log('[Seed] Demo data successfully seeded!');
    console.log('[Seed] Demo credentials:');
    console.log('       alice@example.com / password123 (or username: alice)');
    console.log('       bob@example.com / password123 (or username: bob)');
    console.log('       charlie@example.com / password123 (or username: charlie)');
    console.log('       diana@example.com / password123 (or username: diana)');
  } catch (err) {
    console.error('[Seed] Error seeding demo data:', err.message);
  }
};

module.exports = { seedDemoData };
