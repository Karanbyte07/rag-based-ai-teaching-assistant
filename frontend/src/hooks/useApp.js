import { useContext } from "react";
import { AppContext } from "../context/context";

/** Theme + user settings, shared by every screen. */
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}
