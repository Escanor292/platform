require('dotenv').config();
const { MongoClient } = require('mongodb');

async function testConnection() {
  console.log('\n🧪 Testing MongoDB Connection...\n');
  
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME || 'DuAn';
  
  console.log('URI:', uri ? uri.replace(/:[^:@]+@/, ':****@') : 'NOT FOUND');
  console.log('DB Name:', dbName);
  console.log('');
  
  if (!uri) {
    console.error('❌ MONGODB_URI not found in .env file');
    return;
  }
  
  const client = new MongoClient(uri, {
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    serverSelectionTimeoutMS: 10000,
  });
  
  try {
    console.log('⏳ Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected successfully!\n');
    
    const db = client.db(dbName);
    console.log('📊 Database:', db.databaseName);
    
    const collections = await db.listCollections().toArray();
    console.log('📁 Collections:', collections.length);
    collections.forEach(col => {
      console.log('   -', col.name);
    });
    
    // Test conversations collection
    const conversationsCol = db.collection('conversations');
    const count = await conversationsCol.countDocuments();
    console.log('\n💬 Conversations count:', count);
    
    console.log('\n✅ All tests passed!');
    
  } catch (error) {
    console.error('\n❌ Connection failed!');
    console.error('Error:', error.message);
    console.error('\nDetails:', error);
  } finally {
    await client.close();
    console.log('\n🔌 Connection closed');
  }
}

testConnection();
