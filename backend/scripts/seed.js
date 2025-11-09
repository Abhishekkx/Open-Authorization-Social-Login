require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const AuthLog = require('../models/AuthLog');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await AuthLog.deleteMany({});
    console.log('Cleared existing data');

    // Create sample users
    const users = await User.create([
      {
        email: 'john@example.com',
        name: 'John Doe',
        googleId: 'google-123',
        providers: ['google'],
        role: 'user',
        avatar: 'https://i.pravatar.cc/150?img=1'
      },
      {
        email: 'jane@example.com',
        name: 'Jane Smith',
        facebookId: 'facebook-456',
        providers: ['facebook'],
        role: 'user',
        avatar: 'https://i.pravatar.cc/150?img=2'
      },
      {
        email: 'admin@example.com',
        name: 'Admin User',
        googleId: 'google-789',
        facebookId: 'facebook-789',
        providers: ['google', 'facebook'],
        role: 'admin',
        avatar: 'https://i.pravatar.cc/150?img=3'
      }
    ]);

    console.log(`Created ${users.length} users`);

    // Create sample auth logs
    const logs = [];
    for (const user of users) {
      logs.push({
        userId: user._id,
        action: 'login',
        provider: user.providers[0],
        success: true,
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0'
      });
    }

    await AuthLog.create(logs);
    console.log(`Created ${logs.length} auth logs`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\nSample users:');
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Role: ${user.role}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();
