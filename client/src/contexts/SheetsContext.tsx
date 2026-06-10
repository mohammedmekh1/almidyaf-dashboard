/**
 * SheetsContext.tsx
 * Context مشترك يجلب بيانات Google Sheets مرة واحدة
 * ويوزعها على جميع صفحات اللوحة
 */
import { createContext, useContext, ReactNode } from "react";
import { useGoogleSheets, computeSummary, type SheetsData, type SheetsState } from "@/hooks/useGoogleSheets";

interface SheetsContextValue extends SheetsState {
  summary: ReturnType<typeof computeSummary>;
}

const SheetsContext = createContext<SheetsContextValue | null>(null);

export function SheetsProvider({ children }: { children: ReactNode }) {
  const sheetsState = useGoogleSheets({ autoRefresh: true, intervalMs: 120_000 });
  const summary = computeSummary(sheetsState.data);

  return (
    <SheetsContext.Provider value={{ ...sheetsState, summary }}>
      {children}
    </SheetsContext.Provider>
  );
}

export function useSheets() {
  const ctx = useContext(SheetsContext);
  if (!ctx) throw new Error("useSheets must be used within SheetsProvider");
  return ctx;
}
