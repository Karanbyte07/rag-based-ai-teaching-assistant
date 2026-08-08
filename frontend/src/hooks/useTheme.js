import { useCallback, useEffect, useState } from "react";
import { readStore, writeStore, STORAGE_KEYS } from "../lib/storage";

// Falls back to the OS preference the first time, then remembers the choice.
const initialTheme = () =>
  readStore(STORAGE_KEYS.theme, null) ??
  (window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light");

/** Drives the `dark` class on <html>, which flips the CSS variable scheme. */
export function useTheme() {
  const [theme, setTheme] = useState(initialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    writeStore(STORAGE_KEYS.theme, theme);
  }, [theme]);

  const toggleTheme = useCallback(
    () => setTheme((t) => (t === "dark" ? "light" : "dark")),
    [],
  );

  return { theme, setTheme, toggleTheme, isDark: theme === "dark" };
}
