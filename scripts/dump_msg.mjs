import { MongoClient } from 'mongodb';
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
await client.connect();
const db = client.db(process.env.MONGODB_DB_NAME);
const docs = await db.collection('messages').find({ text: /TUTEFUND_PRODUCT/ }).toArray();
console.log('count:', docs.length);
for (const d of docs) {
  console.log('MSG', d._id?.toString(), '| conv', d.conversationId?.toString());
  const m = d.text.match(/__TUTEFUND_PRODUCT_V1__([\s\S]*?)__END_PRODUCT_V1__/);
  if (m) { try { console.log('PARSED:', JSON.parse(decodeURIComponent(m[1]))); } catch(e) { console.log('PARSE FAIL:', e.message); console.log('RAW:', m[1]); } }
  else console.log('NO MATCH — text:', d.text);
}
await client.close();
