import { MongoClient } from 'mongodb';
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME;
const client = new MongoClient(uri);
await client.connect();
const db = client.db(dbName);
const colls = await db.listCollections().toArray();
console.log('collections:', colls.map(c=>c.name));
const target = colls.find(c => /mess|chat/i.test(c.name));
if (target) {
  const col = db.collection(target.name);
  const docs = await col.find({}).limit(3).toArray();
  docs.forEach(d => console.log(d._id.toString(), '=>', JSON.stringify(d.text||'').slice(0,150)));
}
await client.close();
