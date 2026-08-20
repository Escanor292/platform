import { parseProductSegments, encodeProductMarker } from '../src/components/chat/ProductMessageCard';

const data = {
  id: 'b30ad967-c249-40ff-b6e4-f0b878d56e3b',
  title: 'Bộ hạt giống cây xanh tử tế',
  price: '55.000đ',
  image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200',
  originalPrice: '65.000đ',
};
const marker = encodeProductMarker(data);
const text = `👋 Xin chào Nhà sáng tạo!\n\nTôi muốn trao đổi về sản phẩm của bạn:\n\n${marker}\n\nBạn có thể tư vấn thêm cho tôi về sản phẩm này không?\n🔗 http://localhost:3322/products/b30ad967-c249-40ff-b6e4-f0b878d56e3b`;
const segs = parseProductSegments(text);
console.log('segments:', segs.length);
segs.forEach((s, i) => console.log(i, s.type, s.type === 'product' ? s.data.title : String(s.content).slice(0, 50)));
