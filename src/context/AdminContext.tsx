import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { featuredMatches as seedMatches, promoCards as seedPromos, Match } from "@/data/mockData";

const ADMIN_EMAIL = "cortylixtechnologies@gmail.com";
const ADMIN_PASSWORD = "Luma@1111@";
const SESSION_KEY = "crownbet_admin_session";
const STORE_KEY = "crownbet_admin_store";

export type Promo = { id: string; title: string; color: string; emoji: string; to: string; active?: boolean };
export type AppUser = { id: string; name: string; email: string; balance: number; status: "active" | "suspended" };
export type SiteSettings = {
  siteName: string;
  maintenance: boolean;
  acceptingBets: boolean;
  minStake: number;
  maxStake: number;
  welcomeBonusPct: number;
};

type Store = {
  matches: Match[];
  promos: Promo[];
  users: AppUser[];
  settings: SiteSettings;
};

const defaultStore: Store = {
  matches: seedMatches,
  promos: seedPromos.map((p) => ({ ...p, active: true })),
  users: [
    { id: "u1", name: "John Crown", email: "john@example.com", balance: 250, status: "active" },
    { id: "u2", name: "Sarah Bet", email: "sarah@example.com", balance: 1200, status: "active" },
    { id: "u3", name: "Mike Royal", email: "mike@example.com", balance: 0, status: "suspended" },
  ],
  settings: {
    siteName: "Crownbet",
    maintenance: false,
    acceptingBets: true,
    minStake: 1,
    maxStake: 10000,
    welcomeBonusPct: 100,
  },
};

type AdminCtx = {
  isAdmin: boolean;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
  store: Store;
  // matches
  addMatch: (m: Omit<Match, "id">) => void;
  updateMatch: (id: string, patch: Partial<Match>) => void;
  deleteMatch: (id: string) => void;
  toggleLive: (id: string) => void;
  // promos
  addPromo: (p: Omit<Promo, "id">) => void;
  updatePromo: (id: string, patch: Partial<Promo>) => void;
  deletePromo: (id: string) => void;
  // users
  updateUser: (id: string, patch: Partial<AppUser>) => void;
  deleteUser: (id: string) => void;
  // settings
  updateSettings: (patch: Partial<SiteSettings>) => void;
};

const Ctx = createContext<AdminCtx | null>(null);

const loadStore = (): Store => {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return { ...defaultStore, ...JSON.parse(raw) };
  } catch {}
  return defaultStore;
};

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [store, setStore] = useState<Store>(loadStore);

  useEffect(() => {
    setIsAdmin(localStorage.getItem(SESSION_KEY) === "1");
  }, []);

  useEffect(() => {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
  }, [store]);

  const login = (email: string, password: string) => {
    if (email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      localStorage.setItem(SESSION_KEY, "1");
      setIsAdmin(true);
      return { ok: true };
    }
    return { ok: false, error: "Invalid admin credentials" };
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setIsAdmin(false);
  };

  const uid = (p: string) => `${p}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  const value: AdminCtx = {
    isAdmin,
    login,
    logout,
    store,
    addMatch: (m) => setStore((s) => ({ ...s, matches: [{ ...m, id: uid("m") }, ...s.matches] })),
    updateMatch: (id, patch) =>
      setStore((s) => ({ ...s, matches: s.matches.map((m) => (m.id === id ? { ...m, ...patch } : m)) })),
    deleteMatch: (id) => setStore((s) => ({ ...s, matches: s.matches.filter((m) => m.id !== id) })),
    toggleLive: (id) =>
      setStore((s) => ({
        ...s,
        matches: s.matches.map((m) => (m.id === id ? { ...m, live: !m.live } : m)),
      })),
    addPromo: (p) => setStore((s) => ({ ...s, promos: [{ ...p, id: uid("p") }, ...s.promos] })),
    updatePromo: (id, patch) =>
      setStore((s) => ({ ...s, promos: s.promos.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
    deletePromo: (id) => setStore((s) => ({ ...s, promos: s.promos.filter((p) => p.id !== id) })),
    updateUser: (id, patch) =>
      setStore((s) => ({ ...s, users: s.users.map((u) => (u.id === id ? { ...u, ...patch } : u)) })),
    deleteUser: (id) => setStore((s) => ({ ...s, users: s.users.filter((u) => u.id !== id) })),
    updateSettings: (patch) => setStore((s) => ({ ...s, settings: { ...s.settings, ...patch } })),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useAdmin = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAdmin must be inside AdminProvider");
  return c;
};
