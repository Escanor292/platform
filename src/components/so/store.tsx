import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { CheckoutReceipt, Employee, PayMethod, Role, SoState, ViewId } from "@/lib/so/types";
import { SEED } from "@/lib/so/seed";
import * as eng from "@/lib/so/engine";
import { pullLedger, pushLedger } from "@/lib/so/ledger";

const KEY = "tute-so-v3";
const WHO_KEY = "tute-so-who";
const PINS: Record<string, string> = { e1: "1111", e2: "2222", e3: "3333", e4: "4444", e5: "5555" };

function migrate(s: SoState): SoState {
  const staff = (s.staff?.length ? s.staff : SEED.staff).map((e) => ({
    ...e,
    pin: e.pin || PINS[e.id] || "0000",
    wage: e.wage ?? 0,
    punches: e.punches || [],
  }));
  const known = new Set(s.products.map((p) => p.id));
  return {
    ...s,
    settings: {
      ...SEED.settings,
      ...s.settings,
      bankName: s.settings.bankName || SEED.settings.bankName,
      bankAccount: s.settings.bankAccount || SEED.settings.bankAccount,
      bankOwner: s.settings.bankOwner || SEED.settings.bankOwner,
    },
    branches: s.branches?.length ? s.branches : SEED.branches,
    products: [...s.products, ...SEED.products.filter((p) => !known.has(p.id))],
    staff,
  };
}

type Ask = { title: string; body: string; run: () => void };

type Api = {
  state: SoState;
  view: ViewId;
  role: Role;
  who: Employee | null;
  online: boolean;
  seeCost: boolean;
  setView: (v: ViewId) => void;
  setRole: (r: Role) => void;
  login: (id: string, pin: string) => boolean;
  logout: () => void;
  toast: string | null;
  focus: string | null;
  receipt: CheckoutReceipt | null;
  askBox: Ask | null;
  dismissReceipt: () => void;
  ask: (title: string, body: string, run: () => void) => void;
  closeAsk: () => void;
  go: (v: ViewId, code?: string) => void;
  run: (r: eng.Result) => void;
  reset: () => void;
  addCart: (id: string) => void;
  checkout: (m: PayMethod, opts?: { autoInvoice?: boolean; tendered?: number; offline?: boolean; splitQr?: number }) => void;
};

const Ctx = createContext<Api | null>(null);

export function SoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SoState>(SEED);
  const [view, setView] = useState<ViewId>("pos");
  const [role, setRoleState] = useState<Role>("cashier");
  const [who, setWho] = useState<Employee | null>(null);
  const [online, setOnline] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [focus, setFocus] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<CheckoutReceipt | null>(null);
  const [askBox, setAskBox] = useState<Ask | null>(null);
  const rev = useRef(0);
  const skipPush = useRef(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SoState;
        if (parsed?.products && parsed?.settings) setState(migrate(parsed));
      }
      const whoId = sessionStorage.getItem(WHO_KEY);
      if (whoId) {
        const staff = (JSON.parse(localStorage.getItem(KEY) || "null") as SoState | null)?.staff;
        const hit = (staff || SEED.staff).find((e) => e.id === whoId);
        if (hit) {
          setWho({ ...hit, pin: hit.pin || PINS[hit.id] || "0000", wage: hit.wage ?? 0, punches: hit.punches || [] });
          setRoleState(hit.role);
        }
      }
    } catch {
      /* keep seed */
    }
    setReady(true);
    pullLedger()
      .then((remote) => {
        if (remote?.state?.products && remote.state.settings) {
          rev.current = remote.rev;
          setState(migrate(remote.state));
        }
      })
      .catch(() => undefined)
      .finally(() => {
        skipPush.current = false;
      });
    const sync = () => setOnline(navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(KEY, JSON.stringify(state));
    if (skipPush.current) return;
    const base = rev.current;
    pushLedger({ data: { rev: base, state } })
      .then((res) => {
        if (res.ok) rev.current = res.rev;
        else {
          rev.current = res.current.rev;
          setState(migrate(res.current.state));
          setToast("Quầy khác vừa ghi sổ. Đã lấy bản mới.");
        }
      })
      .catch(() => undefined);
  }, [state, ready]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const run = (r: eng.Result) => {
    setState(r.state);
    setToast(r.message);
    if (r.receipt) setReceipt(r.receipt);
  };

  const setRole = (r: Role) => {
    if (who && who.role !== "owner") return;
    setRoleState(r);
    const home: Record<Role, ViewId> = {
      owner: "home",
      cashier: "pos",
      stock: "kho",
      accountant: "hdra",
      kitchen: "fnb",
    };
    setView(home[r]);
  };

  const api: Api = {
    state,
    view,
    role,
    who,
    online,
    seeCost: role === "owner" || role === "accountant",
    setView,
    setRole,
    login: (id, pin) => {
      const hit = state.staff.find((e) => e.id === id && e.pin === pin);
      if (!hit) return false;
      setWho(hit);
      setRoleState(hit.role);
      sessionStorage.setItem(WHO_KEY, hit.id);
      const home: Record<Role, ViewId> = {
        owner: "home",
        cashier: "pos",
        stock: "kho",
        accountant: "hdra",
        kitchen: "fnb",
      };
      setView(home[hit.role]);
      return true;
    },
    logout: () => {
      setWho(null);
      sessionStorage.removeItem(WHO_KEY);
    },
    toast,
    focus,
    receipt,
    askBox,
    dismissReceipt: () => setReceipt(null),
    ask: (title, body, fn) => setAskBox({ title, body, run: fn }),
    closeAsk: () => setAskBox(null),
    go: (v, code) => {
      setView(v);
      setFocus(code ?? null);
    },
    run,
    reset: () => {
      setState(SEED);
      setToast("Đã trả dữ liệu mẫu.");
    },
    addCart: (id) => run(eng.addCart(state, id)),
    checkout: (m, opts) => run(eng.checkout(state, m, "quay", opts)),
  };

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useSo() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("Sổ chưa sẵn sàng");
  return ctx;
}
