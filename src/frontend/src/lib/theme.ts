export type ThemeMode = "dark" | "light";

export const THEME_STORAGE_KEY = "bcb_theme";

const THEME_COLORS: Record<ThemeMode, string> = {
  dark: "#0f1115",
  light: "#f8fafc",
};

export function getStoredTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return "dark";
  }

  return localStorage.getItem(THEME_STORAGE_KEY) === "light"
    ? "light"
    : "dark";
}

export function applyTheme(theme: ThemeMode) {
  if (typeof document === "undefined") {
    return theme;
  }

  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;

  const themeMeta = document.querySelector('meta[name="theme-color"]');
  themeMeta?.setAttribute("content", THEME_COLORS[theme]);

  if (typeof window !== "undefined") {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }

  return theme;
}

export function initializeTheme() {
  return applyTheme(getStoredTheme());
}
