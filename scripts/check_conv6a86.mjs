import { MongoClient } from 'mongodb';
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME;
const client = new MongoClient(uri);
await client.connect();
const db = client.db(dbName);
const msgs = await db.collection('messages').find({ conversationId: '6a86bd6d6dbff94146f47778' }).sort({createdAt:1}).toArray();
for (const d of msgs) {
  console.log('---', d._id.toString(), '|', d.createdAt?.toISOString());
  console.log(d.text.slice(0, 250));
}
await client.close();
