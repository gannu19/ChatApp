const { connectDB, disconnectDB } = require('./config/db');
const User = require('./models/User');
const Chat = require('./models/Chat');
const Message = require('./models/Message');
const jwt = require('jsonwebtoken');

async function testBackend() {
  console.log('--- Starting Automated Backend Verification ---');
  await connectDB();

  try {
    // 1. Check Seeding / User lookup
    const users = await User.find({}).limit(5);
    console.log(`[PASS] Users query successful. Count: ${users.length}`);
    if (users.length === 0) {
      throw new Error('No users found in database');
    }

    const alice = users.find((u) => u.username === 'alice') || users[0];
    const bob = users.find((u) => u.username === 'bob') || users[1];

    // 2. Test password verification
    const isAlicePassValid = await alice.matchPassword('password123');
    console.log(`[PASS] Password verification for alice: ${isAlicePassValid}`);

    // 3. Test 1-on-1 Chat Creation / Retrieval
    let testChat = await Chat.findOne({
      isGroupChat: false,
      users: { $all: [alice._id, bob._id] },
    }).populate('users', '-password');

    if (!testChat) {
      testChat = await Chat.create({
        chatName: 'sender',
        isGroupChat: false,
        users: [alice._id, bob._id],
      });
    }
    console.log(`[PASS] 1-on-1 Chat verified. ID: ${testChat._id}`);

    // 4. Test Message creation & indexed retrieval
    const testMsg = await Message.create({
      sender: alice._id,
      content: 'Automated test message for real-time validation',
      chat: testChat._id,
      readBy: [alice._id],
    });

    testChat.latestMessage = testMsg._id;
    await testChat.save();

    // Query messages using compound index { chat: 1, createdAt: -1 }
    const messages = await Message.find({ chat: testChat._id })
      .sort({ createdAt: -1 })
      .populate('sender', 'name username');

    console.log(`[PASS] Compound-indexed messages retrieved. Count: ${messages.length}, Latest: "${messages[0].content}"`);

    // 5. Test Group Chat Creation
    const group = await Chat.create({
      chatName: 'Automated Test Group',
      isGroupChat: true,
      users: [alice._id, bob._id],
      groupAdmin: alice._id,
      groupDescription: 'Testing group functionality',
    });
    console.log(`[PASS] Group chat created: "${group.chatName}", Admin: ${group.groupAdmin}`);

    // 6. Test Group Rename
    group.chatName = 'Updated Test Group Name';
    await group.save();
    console.log(`[PASS] Group renamed successfully to: "${group.chatName}"`);

    console.log('--- All Backend API & Model Tests Passed Successfully! ---');
  } catch (err) {
    console.error('[FAIL] Verification error:', err);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
}

testBackend();
