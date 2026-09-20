import { isAuthenticated } from "./_auth.js";

const DEFAULT_SHEET_ID = "1A4zseycVNZ8bkL9qCYdGViiAzjgH7qucvzPw5avJ5qc";

const SOURCES = {
  leads: "leads",
  inventory: "products_catalog",
  orders: "sales_handoff",
  deliveries: "delivery_log",
  salesTasks: "sales_handoff",
  customerService: "interactions_log",
  dailyReports: "daily_reports",
  socialPosts: "social_posts",
  content: "content_queue",
  radarLeads: "google_intel",
  whatsappSessions: "interactions_log",
  sallaPages: "articles",
  journeyLog: "journey_log",
} as const;

type ApiResponse = { sheets: Record<string, string[][]>; rawSheets: Record<string, Record<string, string>[]>; lastUpdated: string; source: string; warnings?: string[] };

function parseCsv(csv: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < csv.length; i += 1) {
    const char = csv[i];
    if (char === '"') {
      if (quoted && csv[i + 1] === '"') { cell += '"'; i += 1; }
      else quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(cell.trim()); cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && csv[i + 1] === "\n") i += 1;
      row.push(cell.trim()); cell = "";
      if (row.some(Boolean)) rows.push(row);
      row = [];
    } else cell += char;
  }
  if (cell || row.length) { row.push(cell.trim()); rows.push(row); }
  return rows;
}

async function fetchSheet(id: string, name: string): Promise<string[][]> {
  const url = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(name)}`;
  const response = await fetch(url, { headers: { accept: "text/csv" } });
  if (!response.ok) throw new Error(`Google Sheets returned ${response.status} for ${name}`);
  return parseCsv(await response.text());
}

function rowsToRecords(rows: string[][]): Record<string, string>[] {
  if (rows.length < 2) return [];
  const headers = rows[0].map((header) => header.trim());
  return rows.slice(1).map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""])));
}

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  if (!isAuthenticated(req)) return res.status(401).json({ error: "يلزم تسجيل الدخول للوصول إلى بيانات اللوحة" });
  const sheetId = process.env.GOOGLE_SHEET_ID || DEFAULT_SHEET_ID;
  try {
    const results = await Promise.all(Object.entries(SOURCES).map(async ([key, name]) => {
      try { return { key, rows: await fetchSheet(sheetId, name) }; }
      catch { return { key, rows: [] as string[][], warning: name }; }
    }));
    const entries = results.map(({ key, rows }) => [key, rows] as const);
    const rawSheets = Object.fromEntries(results.map(({ key, rows }) => [key, rowsToRecords(rows)]));
    const warnings = results.filter((result) => result.warning).map((result) => result.warning as string);
    const payload: ApiResponse = {
      sheets: Object.fromEntries(entries),
      rawSheets,
      lastUpdated: new Date().toISOString(),
      source: warnings.length ? "google-sheets-server-side-fallback" : "google-sheets-server-side",
      ...(warnings.length ? { warnings } : {}),
    };
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
    return res.status(200).json(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Google Sheets error";
    return res.status(200).json({ sheets: {}, rawSheets: {}, lastUpdated: new Date().toISOString(), source: "fallback", warnings: [message] });
  }
}
