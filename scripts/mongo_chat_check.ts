import { MongoClient } from 'mongodb';

// MONGODB_URI là multiline env (được export từng dòng trong các process chạy riêng)
// Lấy URI bằng cách ghép các biến NEXT_PUBLIC style từ env đã load
function resolveMongoUri(): string | null {
  const direct = process.env.MONGODB_URI;
  if (direct && direct.startsWith('mongodb')) return direct;
  const keys = Object.keys(process.env).filter(k => k.toLowerCase().includes('mongodb'));
  for (const k of keys) {
    const v = process.env[k];
    if (v && v.startsWith('mongodb')) return v;
  }
  // .env: MONGODB_URI được định nghĩa nhiều dòng; đọc lại từ file
  try {
    const fs = require('fs');
    const content = fs.readFileSync(require('path').join(__dirname, '..', '.env'), 'utf8');
    const match = content.match(/MONGODB_URI=([^\s"]+)/);
    if (match) return match[1];
  } catch {}
  return null;
}

async function main() {
  const uri = resolveMongoUri();
  if (!uri) {
    console.error('MONGODB_URI not found. Keys:', Object.keys(process.env).filter(k => k.toLowerCase().includes('mongo')).join(', '));
    return;
  }
  console.log('URI found:', uri.replace(/\/\/([^@]+)@/, '//USER:PW@'));
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 15000 });
  try {
    await client.connect();
    const db = client.db();
    console.log('DB NAME:', db.databaseName);
    const cols = await db.listCollections().toArray();
    console.log('COLLECTIONS:', cols.map(c => c.name).join(', '));

    const convs = await db.collection('conversations').find({}).toArray();
    console.log('\n=== CONVERSATIONS ===');
    console.log('Total:', convs.length);
    for (const c of convs) {
      const copy = { ...c };
      (copy as any).messages = copy.messages ? `${copy.messages.length} msgs` : null;
      console.log(JSON.stringify(copy, null, 2).slice(0, 1000));
    }

    const users = await db.collection('users').find({}).toArray();
    console.log('\n=== USERS (mongo) ===');
    console.log('Total:', users.length);
    for (const u of users) {
      console.log(JSON.stringify({ id: u._id, name: u.name, email: u.email }));
    }

    const msgs = await db.collection('messages').countDocuments();
    console.log('\nMESSAGES count:', msgs);
  } catch (e) {
    console.error('MONGO ERROR:', (e as Error).message);
  } finally {
    await client.close();
  }
}

main();
