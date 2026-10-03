const mongoose = require('mongoose');

let mongoServerInstance = null;

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/chatapp';

  try {
    // Attempt standard connection with a short timeout
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`[MongoDB] Connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.log(`[MongoDB] Local/External instance unavailable (${err.message}). Initializing embedded in-memory MongoDB...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoServerInstance = await MongoMemoryServer.create();
      const memoryUri = mongoServerInstance.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`[MongoDB] Connected to In-Memory MongoDB at: ${memoryUri}`);
      
      // Auto seed demo data in memory
      const { seedDemoData } = require('./seed');
      await seedDemoData();
      return conn;
    } catch (memErr) {
      console.error(`[MongoDB] Failed to start In-Memory MongoDB: ${memErr.message}`);
      process.exit(1);
    }
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongoServerInstance) {
    await mongoServerInstance.stop();
  }
};

module.exports = { connectDB, disconnectDB };
