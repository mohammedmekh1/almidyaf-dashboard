/**
 * useGoogleSheets.ts — لحوم المضياف
 * يجلب جميع أوراق الشيت بالتوازي مع تحمّل الأوراق الغائبة
 */

import { useState, useEffect, useCallback } from "react";

// ─── أنواع البيانات ──────────────────────────────────────────────────────────

export interface Lead {
  lead_id: string;
  phone: string;
  name: string;
  source: string;
  platform: string;
  detected_product: string;
  quantity: number;
  location_hint: string;
  category: "hot" | "warm" | "cool" | "cold";
  status: string;
  score: number;
  final_score: number;
  intent: string;
  urgency: string;
  final_contact_channel: string;
  profile_url: string;
  post_url: string;
  has_phone: boolean;
  consent: boolean;
  created_at: string;
  updated_at: string;
  flow_origin: string;
  is_demo: boolean;
}

export interface Order {
  order_id: string;
  order_number: string;
  customer_name: string;
  phone: string;
  main_product: string;
  total: number;
  currency: string;
  items_summary: string;
  shipping_address: string;
  status: string;
  created_at: string;
  flow_origin: string;
}

export interface Delivery {
  delivery_id: string;
  lead_id: string;
  phone: string;
  channel: string;
  status: "delivered" | "failed";
  product_type: string;
  sent_at: string;
  delivered_at: string;
  error_reason: string;
  flow_trigger: string;
}

export interface SalesTask {
  task_id: string;
  lead_id: string;
  name: string;
  phone: string;
  score: number;
  category: "hot" | "warm" | "cool" | "cold";
  product_label: string;
  quantity: number;
  event_type: string;
  location: string;
  action_required: string;
  task_status: "open" | "escalated" | "closed";
  assigned_to: string;
  priority: string;
  sla_minutes: number;
  created_at: string;
}

export interface CustomerService {
  cs_id: string;
  phone: string;
  name: string;
  message: string;
  intent: string;
  auto_reply_sent: boolean;
  needs_human: boolean;
  priority: string;
  channel: string;
  received_at: string;
  flow_origin: string;
}

export interface Content {
  article_id: string;
  meta_title: string;
  keyword_main: string;
  seo_score: number;
  status: "pending_upload" | "ready" | "published" | "failed";
  salla_url: string;
  published_at: string;
}

export interface Inventory {
  item_id: string;
  product_name: string;
  category: string;
  quantity_available: number;
  unit: string;
  price_per_unit: number;
  last_updated: string;
  notes: string;
}

export interface DailyReport {
  report_id: string;
  date: string;
  total_leads: number;
  hot_leads: number;
  total_orders: number;
  total_revenue: number;
  delivery_rate: number;
  notes: string;
}

export interface SocialPost {
  post_id: string;
  platform: string;
  content: string;
  scheduled_at: string;
  published_at: string;
  status: string;
  engagement: number;
  product_tag: string;
}

export interface SheetsData {
  leads: Lead[];
  inventory: Inventory[];
  orders: Order[];
  deliveries: Delivery[];
  salesTasks: SalesTask[];
  customerService: CustomerService[];
  dailyReports: DailyReport[];
  socialPosts: SocialPost[];
  content: Content[];
  lastUpdated: string | null;
}

export interface SheetsState {
  data: SheetsData;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// ─── ثوابت ───────────────────────────────────────────────────────────────────

const SHEETS_ID =
  (import.meta.env.VITE_SHEETS_ID as string) ||
  "1chhGG5pznk6_l45venbJvUDYBnarPBOov1DBOF7AH7s";

const SHEET_NAMES = {
  leads:           "01_leads",
  inventory:       "02_inventory",
  orders:          "03_salla_orders",
  deliveries:      "04_delivery_log",
  salesTasks:      "05_sales_tasks",
  customerService: "06_customer_service_log",
  dailyReports:    "07_daily_reports",
  socialPosts:     "08_social_posts",
  content:         "09_seo_content",
} as const;

const EMPTY_DATA: SheetsData = {
  leads: [], inventory: [], orders: [], deliveries: [],
  salesTasks: [], customerService: [], dailyReports: [],
  socialPosts: [], content: [], lastUpdated: null,
};

// ─── مساعدات ─────────────────────────────────────────────────────────────────

function rowsToObjects(rows: string[][]): Record<string, string>[] {
  if (!rows || rows.length < 2) return [];
  const headers = rows[0].map((h) => h.trim());
  return rows.slice(1).map((row) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = row[i] ?? ""; });
    return obj;
  });
}

const toBool = (v: string) =>
  v === "TRUE" || v === "true" || v === "1" || v === "yes";
const toNum = (v: string) => parseFloat(v) || 0;

// ─── parsers ─────────────────────────────────────────────────────────────────

function parseLeads(rows: string[][]): Lead[] {
  return rowsToObjects(rows).map((r) => ({
    lead_id:               r.lead_id ?? "",
    phone:                 r.phone ?? "",
    name:                  r.name ?? "",
    source:                r.source ?? "",
    platform:              r.platform ?? "",
    detected_product:      r.detected_product ?? "",
    quantity:              toNum(r.quantity),
    location_hint:         r.location_hint ?? "",
    category:              (r.category?.toLowerCase() as Lead["category"]) ?? "cold",
    status:                r.status ?? "",
    score:                 toNum(r.score),
    final_score:           toNum(r.final_score),
    intent:                r.intent ?? "",
    urgency:               r.urgency ?? "",
    final_contact_channel: r.final_contact_channel ?? "",
    profile_url:           r.profile_url ?? "",
    post_url:              r.post_url ?? "",
    has_phone:             toBool(r.has_phone),
    consent:               toBool(r.consent),
    created_at:            r.created_at ?? "",
    updated_at:            r.updated_at ?? "",
    flow_origin:           r.flow_origin ?? "",
    is_demo:               toBool(r.is_demo),
  }));
}

function parseOrders(rows: string[][]): Order[] {
  return rowsToObjects(rows).map((r) => ({
    order_id:         r.order_id ?? "",
    order_number:     r.order_number ?? "",
    customer_name:    r.customer_name ?? "",
    phone:            r.phone ?? "",
    main_product:     r.main_product ?? "",
    total:            toNum(r.total),
    currency:         r.currency || "ر.س",
    items_summary:    r.items_summary ?? "",
    shipping_address: r.shipping_address ?? "",
    status:           r.status ?? "",
    created_at:       r.created_at ?? "",
    flow_origin:      r.flow_origin ?? "",
  }));
}

function parseDeliveries(rows: string[][]): Delivery[] {
  return rowsToObjects(rows).map((r) => ({
    delivery_id:  r.delivery_id ?? "",
    lead_id:      r.lead_id ?? "",
    phone:        r.phone ?? "",
    channel:      r.channel ?? "",
    status:       (r.status as Delivery["status"]) ?? "failed",
    product_type: r.product_type ?? "",
    sent_at:      r.sent_at ?? "",
    delivered_at: r.delivered_at ?? "",
    error_reason: r.error_reason ?? "",
    flow_trigger: r.flow_trigger ?? "",
  }));
}

function parseSalesTasks(rows: string[][]): SalesTask[] {
  return rowsToObjects(rows).map((r) => ({
    task_id:         r.task_id ?? "",
    lead_id:         r.lead_id ?? "",
    name:            r.name ?? "",
    phone:           r.phone ?? "",
    score:           toNum(r.score),
    category:        (r.category?.toLowerCase() as SalesTask["category"]) ?? "cold",
    product_label:   r.product_label ?? "",
    quantity:        toNum(r.quantity),
    event_type:      r.event_type ?? "",
    location:        r.location_hint ?? r.location ?? "",
    action_required: r.action_required ?? "",
    task_status:     (r.task_status as SalesTask["task_status"]) ?? "open",
    assigned_to:     r.assigned_to ?? "",
    priority:        r.priority ?? "",
    sla_minutes:     toNum(r.sla_minutes),
    created_at:      r.created_at ?? "",
  }));
}

function parseCustomerService(rows: string[][]): CustomerService[] {
  return rowsToObjects(rows).map((r) => ({
    cs_id:           r.cs_id ?? "",
    phone:           r.phone ?? "",
    name:            r.name ?? "",
    message:         r.message ?? "",
    intent:          r.intent ?? "",
    auto_reply_sent: toBool(r.auto_reply_sent),
    needs_human:     toBool(r.needs_human),
    priority:        r.priority ?? "",
    channel:         r.channel ?? "",
    received_at:     r.received_at ?? "",
    flow_origin:     r.flow_origin ?? "",
  }));
}

function parseContent(rows: string[][]): Content[] {
  return rowsToObjects(rows).map((r) => ({
    article_id:   r.article_id ?? "",
    meta_title:   r.meta_title ?? r.h1_title ?? "",
    keyword_main: r.keyword_main ?? "",
    seo_score:    toNum(r.seo_score),
    status:       (r.status as Content["status"]) ?? "pending_upload",
    salla_url:    r.salla_url ?? "",
    published_at: r.published_at ?? "",
  }));
}

function parseInventory(rows: string[][]): Inventory[] {
  return rowsToObjects(rows).map((r) => ({
    item_id:            r.item_id ?? "",
    product_name:       r.product_name ?? "",
    category:           r.category ?? "",
    quantity_available: toNum(r.quantity_available),
    unit:               r.unit ?? "",
    price_per_unit:     toNum(r.price_per_unit),
    last_updated:       r.last_updated ?? "",
    notes:              r.notes ?? "",
  }));
}

function parseDailyReports(rows: string[][]): DailyReport[] {
  return rowsToObjects(rows).map((r) => ({
    report_id:     r.report_id ?? "",
    date:          r.date ?? "",
    total_leads:   toNum(r.total_leads),
    hot_leads:     toNum(r.hot_leads),
    total_orders:  toNum(r.total_orders),
    total_revenue: toNum(r.total_revenue),
    delivery_rate: toNum(r.delivery_rate),
    notes:         r.notes ?? "",
  }));
}

function parseSocialPosts(rows: string[][]): SocialPost[] {
  return rowsToObjects(rows).map((r) => ({
    post_id:      r.post_id ?? "",
    platform:     r.platform ?? "",
    content:      r.content ?? "",
    scheduled_at: r.scheduled_at ?? "",
    published_at: r.published_at ?? "",
    status:       r.status ?? "",
    engagement:   toNum(r.engagement),
    product_tag:  r.product_tag ?? "",
  }));
}

// ─── جلب ورقة واحدة مع تحمّل الفشل ─────────────────────────────────────────

async function fetchSheetSafe(sheetName: string): Promise<string[][]> {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SHEETS_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
    const res = await fetch(url);
    if (!res.ok) return [];

    const csv = await res.text();
    if (!csv.trim() || csv.startsWith("<!")) return [];

    const rows: string[][] = [];
    for (const line of csv.split("\n")) {
      if (!line.trim()) continue;
      const cols: string[] = [];
      let cur = "";
      let inQ = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
          if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
          else inQ = !inQ;
        } else if (ch === "," && !inQ) {
          cols.push(cur.trim());
          cur = "";
        } else {
          cur += ch;
        }
      }
      cols.push(cur.trim());
      rows.push(cols);
    }
    return rows;
  } catch {
    return [];
  }
}

// ─── Hook الرئيسي ─────────────────────────────────────────────────────────────

export function useGoogleSheets(
  options: { autoRefresh?: boolean; intervalMs?: number } = {}
): SheetsState {
  const { autoRefresh = false, intervalMs = 120_000 } = options;

  const [data, setData]       = useState<SheetsData>(EMPTY_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    if (!SHEETS_ID) {
      setError("⚠️ VITE_SHEETS_ID غير مضبوط.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [
        leadsRows, inventoryRows, ordersRows, deliveriesRows,
        salesTasksRows, customerServiceRows, dailyReportsRows,
        socialPostsRows, contentRows,
      ] = await Promise.all([
        fetchSheetSafe(SHEET_NAMES.leads),
        fetchSheetSafe(SHEET_NAMES.inventory),
        fetchSheetSafe(SHEET_NAMES.orders),
        fetchSheetSafe(SHEET_NAMES.deliveries),
        fetchSheetSafe(SHEET_NAMES.salesTasks),
        fetchSheetSafe(SHEET_NAMES.customerService),
        fetchSheetSafe(SHEET_NAMES.dailyReports),
        fetchSheetSafe(SHEET_NAMES.socialPosts),
        fetchSheetSafe(SHEET_NAMES.content),
      ]);

      setData({
        leads:           parseLeads(leadsRows),
        inventory:       parseInventory(inventoryRows),
        orders:          parseOrders(ordersRows),
        deliveries:      parseDeliveries(deliveriesRows),
        salesTasks:      parseSalesTasks(salesTasksRows),
        customerService: parseCustomerService(customerServiceRows),
        dailyReports:    parseDailyReports(dailyReportsRows),
        socialPosts:     parseSocialPosts(socialPostsRows),
        content:         parseContent(contentRows),
        lastUpdated:     new Date().toISOString(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطأ غير معروف");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(fetchAll, intervalMs);
    return () => clearInterval(id);
  }, [autoRefresh, intervalMs, fetchAll]);

  return { data, loading, error, refetch: fetchAll };
}

// ─── computeSummary ───────────────────────────────────────────────────────────

export function computeSummary(data: SheetsData) {
  const realLeads  = data.leads.filter((l) => !l.is_demo);
  const hotLeads   = realLeads.filter((l) => l.category === "hot");
  const warmLeads  = realLeads.filter((l) => l.category === "warm");
  const coolLeads  = realLeads.filter((l) => l.category === "cool");
  const coldLeads  = realLeads.filter((l) => l.category === "cold");

  const totalOrders = data.orders.length;
  const totalValue  = data.orders.reduce((s, o) => s + o.total, 0);
  const delivered   = data.deliveries.filter((d) => d.status === "delivered").length;
  const deliveryRate = data.deliveries.length
    ? Math.round((delivered / data.deliveries.length) * 100) : 0;

  const openTasks     = data.salesTasks.filter((t) => t.task_status === "open").length;
  const escalatedTasks = data.salesTasks.filter((t) => t.task_status === "escalated").length;
  const avgScore      = realLeads.length
    ? Math.round(realLeads.reduce((s, l) => s + l.final_score, 0) / realLeads.length) : 0;

  const published    = data.content.filter((c) => c.status === "published").length;
  const pending      = data.content.filter((c) => c.status === "pending_upload" || c.status === "ready").length;
  const avgSeo       = data.content.length
    ? Math.round(data.content.reduce((s, c) => s + c.seo_score, 0) / data.content.length) : 0;

  const urgentCS      = data.customerService.filter((c) => c.needs_human).length;
  const lowStock      = data.inventory.filter((i) => i.quantity_available < 10).length;
  const totalRevenue  = data.dailyReports.reduce((s, r) => s + r.total_revenue, 0);
  const scheduledPosts = data.socialPosts.filter((p) => p.status === "scheduled").length;

  return {
    totalLeads: realLeads.length,
    hotLeads: hotLeads.length,
    warmLeads: warmLeads.length,
    coolLeads: coolLeads.length,
    coldLeads: coldLeads.length,
    totalOrders,
    totalValue,
    deliveryRate,
    openTasks,
    escalatedTasks,
    avgScore,
    publishedContent: published,
    pendingContent: pending,
    avgSeoScore: avgSeo,
    urgentCS,
    lowStock,
    totalRevenue,
    scheduledPosts,
  };
}
