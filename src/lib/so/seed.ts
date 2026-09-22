import type { SoState } from "./types";

const day = (offset: number, hour = 10) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  d.setHours(hour, 12, 0, 0);
  return d.toISOString();
};

export const SEED: SoState = {
  settings: {
    tradeName: "Hộ kinh doanh Tử Tế Goods",
    mst: "0318452201",
    address: "12 Nguyễn Văn Thủ, Đa Kao, Quận 1, TP.HCM",
    regime: "HKD",
    vatReduced: true,
    branch: "Quầy Quận 1",
    periodLocked: false,
    ca: "Chưa gắn",
    costMethod: "Bình quân gia quyền",
    bankName: "Vietcombank",
    bankAccount: "0000000001",
    bankOwner: "HO TU TE — SO MAU",
  },
  branches: [
    { id: "q1", name: "Quầy Quận 1", mst: "0318452201", address: "12 Nguyễn Văn Thủ, Đa Kao, Quận 1, TP.HCM", warehouseId: "w1", symbol: "1C26MTT", next: 91 },
    { id: "ol", name: "Kho online", mst: "0318452201-001", address: "Kho 4, Tân Bình, TP.HCM", warehouseId: "w2", symbol: "1C26TAA", next: 12 },
  ],
  products: [
    { id: "p1", sku: "TT-LINEN-M", name: "Áo linen Tử Tế — M", category: "Thời trang", barcode: "8930001000011", uom: "cái", price: 420000, cost: 210000, taxRate: 0.08, track: "none", minQty: 8, active: true, group: "Áo linen Tử Tế", size: "M" },
    { id: "p1s", sku: "TT-LINEN-S", name: "Áo linen Tử Tế — S", category: "Thời trang", barcode: "8930001000012", uom: "cái", price: 420000, cost: 210000, taxRate: 0.08, track: "none", minQty: 4, active: true, group: "Áo linen Tử Tế", size: "S" },
    { id: "p1l", sku: "TT-LINEN-L", name: "Áo linen Tử Tế — L", category: "Thời trang", barcode: "8930001000013", uom: "cái", price: 440000, cost: 220000, taxRate: 0.08, track: "none", minQty: 4, active: true, group: "Áo linen Tử Tế", size: "L" },
    { id: "p2", sku: "TT-SO-A5", name: "Sổ tay thủ công A5", category: "Văn phòng", barcode: "8930001000028", uom: "quyển", altUom: "lốc", altFactor: 5, price: 95000, cost: 38000, taxRate: 0.08, track: "none", minQty: 20, active: true },
    { id: "p3", sku: "TT-TRA-SEN", name: "Trà sen Tây Hồ 100g", category: "Thực phẩm", barcode: "8930001000035", uom: "hộp", altUom: "thùng", altFactor: 12, price: 180000, cost: 92000, taxRate: 0.08, track: "lot", minQty: 15, active: true },
    { id: "p4", sku: "TT-COMBO", name: "Hộp quà cảm ơn", category: "Combo", barcode: "8930001000042", uom: "bộ", price: 350000, cost: 160000, taxRate: 0.08, track: "none", minQty: 6, active: true },
    { id: "p5", sku: "TT-MUG", name: "Ly sứ men rạn", category: "Nhà cửa", barcode: "8930001000059", uom: "cái", price: 145000, cost: 62000, taxRate: 0.08, track: "none", minQty: 10, active: true },
    { id: "p6", sku: "TT-IMEI", name: "Máy đọc mã cầm tay", category: "Thiết bị", barcode: "8930001000066", uom: "máy", price: 1290000, cost: 780000, taxRate: 0.1, track: "serial", minQty: 1, active: true },
    { id: "p7", sku: "TT-CAFE", name: "Cà phê rang xay 250g", category: "F&B", barcode: "8930001000073", uom: "túi", price: 120000, cost: 54000, taxRate: 0.08, track: "lot", minQty: 12, active: true },
    { id: "p8", sku: "TT-BANH", name: "Bánh quy gừng", category: "F&B", barcode: "8930001000080", uom: "phần", price: 45000, cost: 16000, taxRate: 0.08, track: "none", minQty: 10, active: true },
    { id: "p9", sku: "TT-LY-CF", name: "Ly cà phê tại quán", category: "F&B", barcode: "8930001000097", uom: "ly", price: 45000, cost: 12000, taxRate: 0.08, track: "none", minQty: 0, active: true, recipe: [{ productId: "p10", qty: 1 }] },
    { id: "p10", sku: "NL-SHOT", name: "Shot cà phê", category: "Nguyên liệu", barcode: "8930001000103", uom: "shot", price: 0, cost: 8000, taxRate: 0, track: "none", minQty: 20, active: true, sell: false },
  ],
  warehouses: [
    { id: "w1", name: "Quầy Quận 1", kind: "store" },
    { id: "w2", name: "Kho online", kind: "online" },
    { id: "w3", name: "Bếp studio", kind: "kitchen" },
  ],
  lots: [
    { id: "l1", productId: "p3", warehouseId: "w1", lot: "SEN-2408", expiry: day(18), qty: 14 },
    { id: "l2", productId: "p3", warehouseId: "w1", lot: "SEN-2511", expiry: day(120), qty: 36 },
    { id: "l3", productId: "p3", warehouseId: "w2", lot: "SEN-2511", expiry: day(120), qty: 48 },
    { id: "l4", productId: "p7", warehouseId: "w3", lot: "CF-0901", expiry: day(40), qty: 22 },
    { id: "l5", productId: "p7", warehouseId: "w1", lot: "CF-0901", expiry: day(40), qty: 9 },
  ],
  parties: [
    { id: "c1", kind: "customer", name: "Khách lẻ", mst: "", phone: "", email: "", points: 0, tier: "Đồng", debt: 0, limit: 0 },
    { id: "c2", kind: "customer", name: "Nguyễn Mai Chi", mst: "8012345678", phone: "0903123456", email: "maichi@example.com", points: 860, tier: "Vàng", debt: 0, limit: 5000000 },
    { id: "c3", kind: "customer", name: "Studio Ánh", mst: "0311122233", phone: "02873001122", email: "ketoan@studioanh.vn", points: 240, tier: "Bạc", debt: 420000, limit: 8000000 },
    { id: "c4", kind: "customer", name: "Lê Quốc Bảo", mst: "", phone: "0918777001", email: "bao.le@example.com", points: 40, tier: "Đồng", debt: 0, limit: 1000000 },
    { id: "s1", kind: "supplier", name: "Xưởng linen Bình Thạnh", mst: "0315566778", phone: "02838990011", email: "xuat@linenbt.vn", points: 0, tier: "Đồng", debt: 2100000, limit: 0 },
    { id: "s2", kind: "supplier", name: "HTX chè sen Quảng An", mst: "0109988776", phone: "02437112233", email: "htx@quangan.vn", points: 0, tier: "Đồng", debt: 0, limit: 0 },
    { id: "s3", kind: "supplier", name: "Bao bì Sài Gòn", mst: "0304455667", phone: "02835112200", email: "order@baobisg.vn", points: 0, tier: "Đồng", debt: 640000, limit: 0 },
  ],
  sales: [
    { id: "sa1", no: "BH-1042", at: day(-1, 11), channel: "quay", warehouseId: "w1", customerId: "c2", lines: [{ productId: "p1", name: "Áo linen Tử Tế — M", qty: 1, price: 420000, discount: 0, taxRate: 0.08, cost: 210000 }], payments: [{ method: "qr", amount: 420000 }], subtotal: 388889, vat: 31111, total: 420000, invoiceId: "iv1", status: "paid" },
    { id: "sa2", no: "BH-1041", at: day(-1, 15), channel: "shopee", warehouseId: "w2", customerId: "c4", lines: [{ productId: "p2", name: "Sổ tay thủ công A5", qty: 3, price: 95000, discount: 0, taxRate: 0.08, cost: 38000 }], payments: [{ method: "debt", amount: 285000 }], subtotal: 263889, vat: 21111, total: 285000, status: "cod", ship: "GHN · SPX22911 · chờ đối soát" },
    { id: "sa3", no: "BH-1038", at: day(-2, 19), channel: "fnb", warehouseId: "w1", customerId: "c1", lines: [{ productId: "p8", name: "Bánh quy gừng", qty: 2, price: 45000, discount: 0, taxRate: 0.08, cost: 16000 }, { productId: "p7", name: "Cà phê rang xay 250g", qty: 1, price: 120000, discount: 0, taxRate: 0.08, cost: 54000 }], payments: [{ method: "cash", amount: 210000 }], subtotal: 194444, vat: 15556, total: 210000, invoiceId: "iv2", status: "paid", tableId: "t2" },
    { id: "sa4", no: "BH-1033", at: day(-4, 9), channel: "web", warehouseId: "w2", customerId: "c3", lines: [{ productId: "p4", name: "Hộp quà cảm ơn", qty: 4, price: 350000, discount: 40000, taxRate: 0.08, cost: 160000 }], payments: [{ method: "debt", amount: 1360000 }], subtotal: 1259259, vat: 100741, total: 1360000, status: "debt", note: "Công nợ Studio Ánh" },
    { id: "sa5", no: "BH-1028", at: day(-6, 14), channel: "tiktok", warehouseId: "w2", customerId: "c1", lines: [{ productId: "p5", name: "Ly sứ men rạn", qty: 2, price: 145000, discount: 0, taxRate: 0.08, cost: 62000 }], payments: [{ method: "qr", amount: 290000 }], subtotal: 268519, vat: 21481, total: 290000, invoiceId: "iv3", status: "paid", ship: "J&T · đã giao" },
  ],
  invoices: [
    { id: "iv1", no: "HD-00088", kind: "MTT", status: "coded", direction: "out", at: day(-1, 11), buyerName: "Nguyễn Mai Chi", buyerMst: "8012345678", subtotal: 388889, vat: 31111, total: 420000, saleId: "sa1", cqtCode: "CQT-7F2A91" },
    { id: "iv2", no: "HD-00086", kind: "MTT", status: "coded", direction: "out", at: day(-2, 19), buyerName: "Khách lẻ", buyerMst: "", subtotal: 194444, vat: 15556, total: 210000, saleId: "sa3", cqtCode: "CQT-1B90CC" },
    { id: "iv3", no: "HD-00081", kind: "GTGT", status: "coded", direction: "out", at: day(-6, 14), buyerName: "Khách lẻ", buyerMst: "", subtotal: 268519, vat: 21481, total: 290000, saleId: "sa5", cqtCode: "CQT-44DE02" },
    { id: "iv4", no: "HD-00090", kind: "GTGT", status: "waiting", direction: "out", at: day(0, 8), buyerName: "Studio Ánh", buyerMst: "0311122233", subtotal: 1259259, vat: 100741, total: 1360000, saleId: "sa4", note: "Chờ mã cơ quan thuế" },
    { id: "iv5", no: "HD-00079", kind: "GTGT", status: "error", direction: "out", at: day(-8, 16), buyerName: "Lê Quốc Bảo", buyerMst: "000", subtotal: 87963, vat: 7037, total: 95000, note: "MST người mua không hợp lệ" },
    { id: "ap1", no: "MV-2219", kind: "GTGT", status: "coded", direction: "in", at: day(-3, 9), buyerName: "Xưởng linen Bình Thạnh", buyerMst: "0315566778", subtotal: 3888889, vat: 311111, total: 4200000, poId: "po1", cqtCode: "CQT-IN-8821", match: "matched" },
    { id: "ap2", no: "MV-1180", kind: "GTGT", status: "coded", direction: "in", at: day(-5, 11), buyerName: "HTX chè sen Quảng An", buyerMst: "0109988776", subtotal: 1666667, vat: 133333, total: 1800000, poId: "po2", cqtCode: "CQT-IN-4410", match: "qty" },
    { id: "ap3", no: "MV-0902", kind: "GTGT", status: "coded", direction: "in", at: day(-9), buyerName: "Công ty ma ABC", buyerMst: "9999999999", subtotal: 500000, vat: 40000, total: 540000, cqtCode: "", match: "missing", note: "MST ngừng hoạt động — không khấu trừ" },
  ],
  pos: [
    { id: "po1", no: "PO-017", supplierId: "s1", status: "received", lines: [{ productId: "p1", qty: 20, price: 210000, received: 20 }] },
    { id: "po2", no: "PO-018", supplierId: "s2", status: "partial", lines: [{ productId: "p3", qty: 40, price: 90000, received: 24 }] },
    { id: "po3", no: "PO-019", supplierId: "s3", status: "sent", lines: [{ productId: "p4", qty: 30, price: 70000, received: 0 }] },
  ],
  moves: [
    { id: "m1", at: day(-12), type: "in", productId: "p1", warehouseId: "w1", qty: 18, ref: "DK", note: "Tồn đầu kỳ quầy" },
    { id: "m2", at: day(-12), type: "in", productId: "p2", warehouseId: "w1", qty: 32, ref: "DK", note: "Tồn đầu kỳ" },
    { id: "m3", at: day(-12), type: "in", productId: "p2", warehouseId: "w2", qty: 10, ref: "DK", note: "Tồn online" },
    { id: "m4", at: day(-12), type: "in", productId: "p4", warehouseId: "w1", qty: 11, ref: "DK", note: "Tồn đầu kỳ" },
    { id: "m5", at: day(-12), type: "in", productId: "p5", warehouseId: "w1", qty: 16, ref: "DK", note: "Tồn đầu kỳ" },
    { id: "m6", at: day(-12), type: "in", productId: "p5", warehouseId: "w2", qty: 6, ref: "DK", note: "Tồn online" },
    { id: "m7", at: day(-12), type: "in", productId: "p6", warehouseId: "w1", qty: 3, ref: "DK", note: "Serial còn 3 máy" },
    { id: "m8", at: day(-12), type: "in", productId: "p8", warehouseId: "w1", qty: 28, ref: "DK", note: "Tồn bánh" },
    { id: "m10", at: day(-12), type: "in", productId: "p1s", warehouseId: "w1", qty: 6, ref: "DK", note: "Áo size S" },
    { id: "m11", at: day(-12), type: "in", productId: "p1l", warehouseId: "w1", qty: 5, ref: "DK", note: "Áo size L" },
    { id: "m12", at: day(-12), type: "in", productId: "p10", warehouseId: "w1", qty: 40, ref: "DK", note: "Shot cà phê" },
    { id: "m9", at: day(-2), type: "transfer", productId: "p2", warehouseId: "w1", toWarehouseId: "w2", qty: 4, ref: "CK-04", note: "Phiếu xuất kho kiêm vận chuyển nội bộ" },
  ],
  journals: [
    { id: "j0", at: day(-20), memo: "Số dư đầu kỳ", source: "open", lines: [{ account: "111", name: "Tiền mặt", debit: 8500000, credit: 0 }, { account: "112", name: "Tiền gửi", debit: 24600000, credit: 0 }, { account: "156", name: "Hàng tồn kho", debit: 18200000, credit: 0 }, { account: "331", name: "Phải trả", debit: 0, credit: 2740000 }, { account: "411", name: "Vốn chủ", debit: 0, credit: 48560000 }] },
  ],
  bank: [
    { id: "b1", at: day(-1, 11), desc: "VietQR Mai Chi · BH-1042", amount: 420000, matchedSaleId: "sa1" },
    { id: "b2", at: day(-6, 14), desc: "Thu TikTok Shop · BH-1028", amount: 290000, matchedSaleId: "sa5" },
    { id: "b3", at: day(0, 7), desc: "CK lẻ chưa rõ nội dung", amount: 350000 },
    { id: "b4", at: day(-2), desc: "Phí nền tảng Shopee", amount: -18500 },
  ],
  shifts: [
    { id: "sh1", user: "Lan Thu ngân", openedAt: day(0, 8), openCash: 1500000, sales: 0, status: "open" },
    { id: "sh0", user: "Lan Thu ngân", openedAt: day(-1, 8), closedAt: day(-1, 21), openCash: 1200000, closeCash: 1620000, sales: 630000, status: "closed" },
  ],
  tables: [
    { id: "t1", name: "Bàn 1", zone: "Sân", status: "empty", covers: 0, lines: [] },
    { id: "t2", name: "Bàn 2", zone: "Sân", status: "kitchen", covers: 2, lines: [{ key: "k1", productId: "p8", qty: 2, price: 45000, discount: 0, sent: true }] },
    { id: "t3", name: "Bàn 3", zone: "Trong", status: "seated", covers: 4, lines: [{ key: "k2", productId: "p7", qty: 2, price: 120000, discount: 0 }] },
    { id: "t4", name: "Bàn 4", zone: "Trong", status: "bill", covers: 2, lines: [{ key: "k3", productId: "p8", qty: 1, price: 45000, discount: 0 }, { key: "k4", productId: "p5", qty: 1, price: 145000, discount: 0 }] },
    { id: "t5", name: "Bàn 5", zone: "Trong", status: "empty", covers: 0, lines: [] },
    { id: "t6", name: "Phòng karaoke", zone: "Giờ", status: "empty", covers: 0, lines: [] },
  ],
  staff: [
    { id: "e1", name: "Phú Tài", role: "owner", branch: "Quầy Quận 1", commission: 0, pin: "1111", wage: 0, punches: [] },
    { id: "e2", name: "Lan Thu ngân", role: "cashier", branch: "Quầy Quận 1", commission: 0.01, pin: "2222", wage: 35000, punches: [] },
    { id: "e3", name: "Minh Kho", role: "stock", branch: "Kho online", commission: 0, pin: "3333", wage: 32000, punches: [] },
    { id: "e4", name: "Hà Kế toán", role: "accountant", branch: "Quầy Quận 1", commission: 0, pin: "4444", wage: 45000, punches: [] },
    { id: "e5", name: "Khoa Bếp", role: "kitchen", branch: "Bếp studio", commission: 0, pin: "5555", wage: 30000, punches: [] },
  ],
  audits: [
    { id: "a1", at: day(-1, 11), actor: "Lan Thu ngân", action: "Phát hành HĐ MTT", detail: "HD-00088 đã có mã CQT-7F2A91" },
    { id: "a2", at: day(0, 8), actor: "Lan Thu ngân", action: "Mở ca", detail: "Quỹ đầu ca 1.500.000 ₫" },
  ],
  cart: [],
  holds: [],
  seq: 200,
};
