import { useCallback, useEffect, useState } from "react";
import { readStore, writeStore, STORAGE_KEYS } from "../lib/storage";

// Falls back to light mode the first time, then remembers the user's choice.
const initialTheme = () =>
  readStore(STORAGE_KEYS.theme, null) ?? "light";

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
