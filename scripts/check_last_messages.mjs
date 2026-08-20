import { MongoClient, ObjectId } from 'mongodb';
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
await client.connect();
const db = client.db("DuAn");
const convId = process.argv[2] || '6a86bd6d6dbff94146f47778';
const msgs = await db.collection('messages')
    .find({ conversationId: new ObjectId(convId) })
    .sort({ createdAt: -1 })
    .limit(6)
    .toArray();
for (const m of msgs) {
    console.log(`[${m.type}] ${String(m.createdAt)} | ${String(m.text || '').slice(0, 100)}`);
}
await client.close();
