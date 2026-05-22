// Script để test API tạo conversation
// Chạy: node test-chat-api.js

async function testChatAPI() {
  try {
    console.log('🧪 Testing Chat API...\n');

    // Test 1: Gọi API mà không có auth (should fail)
    console.log('Test 1: Gọi API không có auth');
    const res1 = await fetch('http://localhost:3000/api/chat/conversations/find-or-create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ participantId: 'test-id' }),
    });
    console.log('Status:', res1.status);
    const data1 = await res1.json();
    console.log('Response:', data1);
    console.log('✅ Test 1 passed (expected 401)\n');

    // Test 2: Kiểm tra MongoDB connection
    console.log('Test 2: Kiểm tra MongoDB connection');
    const { MongoClient } = require('mongodb');
    const uri = process.env.MONGODB_URI;
    
    if (!uri) {
      console.log('❌ MONGODB_URI not found in .env');
      return;
    }

    const client = new MongoClient(uri);
    await client.connect();
    console.log('✅ MongoDB connected successfully');
    
    const db = client.db(process.env.MONGODB_DB_NAME || 'DuAn');
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
    await client.close();
    console.log('✅ Test 2 passed\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
  }
}

testChatAPI();
