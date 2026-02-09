const mongoose = require('mongoose');

async function testConnection() {
  try {
    // Test with the .env.local value
    const uri = 'mongodb://localhost:27017/device-checking';
    
    console.log('🔍 Testing MongoDB connection...');
    console.log('📝 URI:', uri);
    
    // Validate format
    if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
      console.error('❌ Invalid MongoDB URI format');
      process.exit(1);
    }
    
    console.log('✅ MongoDB URI format is valid');
    
    // Attempt connection
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log('✅ MongoDB connected successfully!');
    console.log('📊 Connection state:', mongoose.connection.readyState);
    
    await mongoose.connection.close();
    console.log('✅ Connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();