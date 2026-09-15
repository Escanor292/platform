export const THEME_STORAGE_KEY = "tute-theme";
export const LOCALE_STORAGE_KEY = "tute-locale";

export type ThemePreference = "light" | "dark" | "system";
export type Locale = "vi" | "en";

export function parseLocale(value: string | null | undefined): Locale {
  return value === "en" ? "en" : "vi";
}

export function parseTheme(value: string | null | undefined): ThemePreference {
  if (value === "dark" || value === "system" || value === "light") return value;
  return "light";
}

export function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const prefix = `${name}=`;
  const match = document.cookie.split("; ").find((row) => row.startsWith(prefix));
  if (!match) return null;
  try {
    return decodeURIComponent(match.slice(prefix.length));
  } catch {
    return match.slice(prefix.length);
  }
}

export function setPreferenceCookie(name: string, value: string) {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
}

/** Inline, runs before paint to avoid a light flash and wrong html lang. */
export const PREFERENCE_BOOTSTRAP_SCRIPT = `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var raw=null;try{raw=localStorage.getItem(k);}catch(e){}if(!raw){var m=document.cookie.match(/(?:^|; )${THEME_STORAGE_KEY}=([^;]*)/);raw=m?decodeURIComponent(m[1]):"light";}var theme=raw;if(theme==="system"){theme=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}if(theme==="dark"){document.documentElement.classList.add("dark");}else{document.documentElement.classList.remove("dark");}var loc=null;try{loc=localStorage.getItem(${JSON.stringify(LOCALE_STORAGE_KEY)});}catch(e){}if(!loc){var lm=document.cookie.match(/(?:^|; )${LOCALE_STORAGE_KEY}=([^;]*)/);loc=lm?decodeURIComponent(lm[1]):"vi";}if(loc==="en"||loc==="vi"){document.documentElement.lang=loc;}}catch(e){}})();`;
