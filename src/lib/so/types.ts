export type ViewId =
  | "home"
  | "pos"
  | "fnb"
  | "omni"
  | "kho"
  | "mua"
  | "hdra"
  | "hdvao"
  | "so"
  | "thue"
  | "bc"
  | "dm"
  | "ns"
  | "crm"
  | "nh"
  | "ht"
  | "map";

export type Role = "owner" | "cashier" | "stock" | "accountant" | "kitchen";
export type Channel = "quay" | "shopee" | "tiktok" | "web" | "fnb";
export type PayMethod = "cash" | "qr" | "card" | "point" | "debt";

export interface CheckoutReceipt {
  no: string;
  total: number;
  tendered: number;
  change: number;
  method: PayMethod;
  invoiceNo?: string;
  cqt?: string;
  queued?: boolean;
  waitingPay?: boolean;
  lines: { name: string; qty: number; amount: number }[];
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  barcode: string;
  uom: string;
  altUom?: string;
  altFactor?: number;
  price: number;
  cost: number;
  taxRate: number;
  track: "none" | "lot" | "serial";
  minQty: number;
  active: boolean;
  group?: string;
  size?: string;
  sell?: boolean;
  recipe?: { productId: string; qty: number }[];
}

export interface Warehouse {
  id: string;
  name: string;
  kind: "store" | "online" | "kitchen";
}

export interface Lot {
  id: string;
  productId: string;
  warehouseId: string;
  lot: string;
  expiry?: string;
  qty: number;
}

export interface Party {
  id: string;
  kind: "customer" | "supplier";
  name: string;
  mst: string;
  phone: string;
  email: string;
  points: number;
  tier: "Đồng" | "Bạc" | "Vàng";
  debt: number;
  limit: number;
}

export interface CartLine {
  key: string;
  productId: string;
  qty: number;
  price: number;
  discount: number;
  lotId?: string;
  serial?: string;
  sent?: boolean;
}

export interface HeldCart {
  id: string;
  label: string;
  lines: CartLine[];
  customerId?: string;
}

export interface Payment {
  method: PayMethod;
  amount: number;
}

export interface SaleLine {
  productId: string;
  name: string;
  qty: number;
  price: number;
  discount: number;
  taxRate: number;
  cost: number;
}

export interface Sale {
  id: string;
  no: string;
  at: string;
  channel: Channel;
  warehouseId: string;
  customerId?: string;
  lines: SaleLine[];
  payments: Payment[];
  subtotal: number;
  vat: number;
  total: number;
  invoiceId?: string;
  shiftId?: string;
  tableId?: string;
  status: "paid" | "debt" | "cod" | "held";
  ship?: string;
  note?: string;
}

export interface EInvoice {
  id: string;
  no: string;
  kind: "GTGT" | "MTT" | "DIEU_CHINH" | "THAY_THE";
  status: "draft" | "waiting" | "coded" | "error" | "cancelled" | "replaced";
  direction: "out" | "in";
  at: string;
  buyerName: string;
  buyerMst: string;
  subtotal: number;
  vat: number;
  total: number;
  saleId?: string;
  poId?: string;
  cqtCode?: string;
  seal?: string;
  originalId?: string;
  match?: "pending" | "matched" | "qty" | "price" | "missing";
  note?: string;
}

export interface PoLine {
  productId: string;
  qty: number;
  price: number;
  received: number;
}

export interface PurchaseOrder {
  id: string;
  no: string;
  supplierId: string;
  status: "draft" | "sent" | "partial" | "received";
  lines: PoLine[];
}

export interface Move {
  id: string;
  at: string;
  type: "in" | "out" | "transfer" | "count";
  productId: string;
  warehouseId: string;
  toWarehouseId?: string;
  qty: number;
  lot?: string;
  ref: string;
  note: string;
}

export interface JournalLine {
  account: string;
  name: string;
  debit: number;
  credit: number;
}

export interface Journal {
  id: string;
  at: string;
  memo: string;
  source: string;
  lines: JournalLine[];
}

export interface BankLine {
  id: string;
  at: string;
  desc: string;
  amount: number;
  matchedSaleId?: string;
}

export interface Shift {
  id: string;
  user: string;
  openedAt: string;
  closedAt?: string;
  openCash: number;
  closeCash?: number;
  sales: number;
  status: "open" | "closed";
}

export interface DiningTable {
  id: string;
  name: string;
  zone: string;
  status: "empty" | "seated" | "kitchen" | "bill";
  covers: number;
  lines: CartLine[];
}

export interface Employee {
  id: string;
  name: string;
  role: Role;
  branch: string;
  commission: number;
  pin: string;
  wage: number;
  punches: { at: string; dir: "in" | "out" }[];
}

export interface Audit {
  id: string;
  at: string;
  actor: string;
  action: string;
  detail: string;
}

export interface Settings {
  tradeName: string;
  mst: string;
  address: string;
  regime: "HKD" | "DN";
  vatReduced: boolean;
  branch: string;
  periodLocked: boolean;
  ca: "HSM cloud" | "USB token" | "Chưa gắn";
  costMethod: "Bình quân gia quyền";
  bankName: string;
  bankAccount: string;
  bankOwner: string;
}

export interface Branch {
  id: string;
  name: string;
  mst: string;
  address: string;
  warehouseId: string;
  symbol: string;
  next: number;
}

export interface SoState {
  settings: Settings;
  branches: Branch[];
  products: Product[];
  warehouses: Warehouse[];
  lots: Lot[];
  parties: Party[];
  sales: Sale[];
  invoices: EInvoice[];
  pos: PurchaseOrder[];
  moves: Move[];
  journals: Journal[];
  bank: BankLine[];
  shifts: Shift[];
  tables: DiningTable[];
  staff: Employee[];
  audits: Audit[];
  cart: CartLine[];
  cartCustomerId?: string;
  holds: HeldCart[];
  seq: number;
}
