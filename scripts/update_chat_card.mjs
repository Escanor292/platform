import { MongoClient } from 'mongodb';
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME;
const client = new MongoClient(uri);
await client.connect();
const db = client.db(dbName);
const msgs = db.collection('messages');
const doc = await msgs.findOne({ text: /trao đổi về sản phẩm/ });
if (!doc) { console.log('không tìm thấy'); process.exit(0); }
console.log('cũ:', doc.text.slice(0, 180));
const marker = `__TUTEFUND_PRODUCT_V1__${encodeURIComponent(JSON.stringify({
  id: 'b30ad967-c249-40ff-b6e4-f0b878d56e3b',
  title: 'Bộ hạt giống cây xanh tử tế',
  price: '55.000đ',
  image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200',
  originalPrice: '65.000đ',
}))}__END_PRODUCT_V1__`;
const newIntro = `👋 Xin chào Nhà sáng tạo!\n\nTôi muốn trao đổi về sản phẩm của bạn:\n\n${marker}\n\nBạn có thể tư vấn thêm cho tôi về sản phẩm này không?\n🔗 http://localhost:3322/products/b30ad967-c249-40ff-b6e4-f0b878d56e3b`;
const r = await msgs.updateOne({ _id: doc._id }, { $set: { text: newIntro } });
console.log('updated:', r.modifiedCount, '| mới:', newIntro.slice(0, 200));
await client.close();
