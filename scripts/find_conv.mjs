import { MongoClient } from 'mongodb';
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME;
const client = new MongoClient(uri);
await client.connect();
const db = client.db(dbName);
const msgs = db.collection('messages');
const docs = await msgs.find({ text: /TUTEFUND_PRODUCT/ }).toArray();
for (const d of docs) {
  console.log('msg', d._id.toString(), '| conv', d.conversationId.toString(), '| sender', d.senderId);
}
const convs = await db.collection('conversations').find({}).toArray();
for (const c of convs) {
  console.log('conv', c._id.toString(), '| participants:', (c.participantIds||[]).join(','));
}
await client.close();
