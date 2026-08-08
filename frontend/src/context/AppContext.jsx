import { useCallback, useMemo, useState } from "react";
import { AppContext } from "./context";
import { useTheme } from "../hooks/useTheme";
import { readStore, writeStore, STORAGE_KEYS, DEFAULT_SETTINGS } from "../lib/storage";

/** Holds the two things every screen needs: the theme and user settings. */
export function AppProvider({ children }) {
  const theme = useTheme();
  const [settings, setSettings] = useState(() => ({
    ...DEFAULT_SETTINGS,
    ...readStore(STORAGE_KEYS.settings, {}),
  }));

  const updateSettings = useCallback((patch) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      writeStore(STORAGE_KEYS.settings, next);
      return next;
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    writeStore(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
  }, []);

  const value = useMemo(
    () => ({ ...theme, settings, updateSettings, resetSettings }),
    [theme, settings, updateSettings, resetSettings],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export default AppProvider;
