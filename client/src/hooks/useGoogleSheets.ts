/**
 * useGoogleSheets.ts
 * Hook لقراءة جميع أوراق Google Sheets لمشروع المضياف
 *
 * الإعداد المطلوب:
 * 1. اجعل الشيت عاماً (Share → Anyone with the link → Viewer)
 * 2. أضف VITE_SHEETS_ID=<معرف الشيت> في Vercel Environment Variables
 * 3. أسماء الأوراق يجب أن تكون: Leads, Orders, Deliveries, SalesTasks, CustomerService, Content
 *
 * كيف تحصل على معرف الشيت؟
 * من رابط الشيت: https://docs.google.com/spreadsheets/d/[SHEETS_ID]/edit
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
  status: "pending_upload" | "published" | "failed";
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

export interface RadarLead {
  radar_id: string;
  phone: string;
  name: string;
  source: string;
  detected_intent: string;
  score: number;
  created_at: string;
  notes: string;
}

export interface WhatsAppSession {
  session_id: string;
  phone: string;
  name: string;
  last_message: string;
  status: string;
  agent: string;
  started_at: string;
  updated_at: string;
}

export interface SallaPage {
  page_id: string;
  title: string;
  url: string;
  status: string;
  views: number;
  conversion_rate: number;
  last_updated: string;
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
  radarLeads: RadarLead[];
  whatsappSessions: WhatsAppSession[];
  sallaPages: SallaPage[];
  lastUpdated: string | null;
}

export interface SheetsState {
  data: SheetsData;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// ─── ثوابت ───────────────────────────────────────────────────────────────────

const SHEETS_ID = (import.meta.env.VITE_SHEETS_ID as string) || "1chhGG5pznk6_l45venbJvUDYBnarPBOov1DBOF7AH7s";
const API_KEY   = import.meta.env.VITE_GOOGLE_API_KEY as string; // اختياري إذا الشيت عام

// أسماء الأوراق — تأكد أنها مطابقة تماماً لأسماء tabs في الشيت
const SHEET_NAMES = {
  leads:            "01_leads",
  inventory:        "02_inventory",
  orders:           "03_salla_orders",
  deliveries:       "04_delivery_log",
  salesTasks:       "05_sales_tasks",
  customerService:  "06_customer_service_log",
  dailyReports:     "07_daily_reports",
  socialPosts:      "08_social_posts",
  content:          "09_seo_content",
  radarLeads:       "10_Radar_Leads",
  whatsappSessions: "11_WhatsApp_Sessions",
  sallaPages:       "12_Salla_Pages",
} as const;

// قيمة افتراضية فارغة
const EMPTY_DATA: SheetsData = {
  leads:            [],
  inventory:        [],
  orders:           [],
  deliveries:       [],
  salesTasks:       [],
  customerService:  [],
  dailyReports:     [],
  socialPosts:      [],
  content:          [],
  radarLeads:       [],
  whatsappSessions: [],
  sallaPages:       [],
  lastUpdated:      null,
};

// ─── مساعدات تحويل البيانات ──────────────────────────────────────────────────

/**
 * يحوّل صفوف الشيت (مصفوفة من المصفوفات) إلى مصفوفة من الكائنات
 * الصف الأول = أسماء الأعمدة (headers)
 */
function rowsToObjects(rows: string[][]): Record<string, string>[] {
  if (!rows || rows.length < 2) return [];
  const headers = rows[0].map((h) => h.trim());
  return rows.slice(1).map((row) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
      obj[h] = row[i] ?? "";
    });
    return obj;
  });
}

const toBool = (v: string) => v === "TRUE" || v === "true" || v === "1" || v === "yes";
const toNum  = (v: string) => parseFloat(v) || 0;

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
    category:              (r.category as Lead["category"]) ?? "cold",
    status:                r.status ?? "",
    score:                 toNum(r.score),
    final_score:           toNum(r.final_score),
    intent:                r.intent ?? "",
    urgency:               r.urgency ?? "",
    final_contact_channel: r.final_contact_channel ?? "",
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
    currency:         r.currency ?? "ر.س",
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
    category:        (r.category as SalesTask["category"]) ?? "cold",
    product_label:   r.product_label ?? "",
    quantity:        toNum(r.quantity),
    event_type:      r.event_type ?? "",
    location:        r.location ?? "",
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
    cs_id:            r.cs_id ?? "",
    phone:            r.phone ?? "",
    name:             r.name ?? "",
    message:          r.message ?? "",
    intent:           r.intent ?? "",
    auto_reply_sent:  toBool(r.auto_reply_sent),
    needs_human:      toBool(r.needs_human),
    priority:         r.priority ?? "",
    channel:          r.channel ?? "",
    received_at:      r.received_at ?? "",
    flow_origin:      r.flow_origin ?? "",
  }));
}

function parseContent(rows: string[][]): Content[] {
  return rowsToObjects(rows).map((r) => ({
    article_id:   r.article_id ?? "",
    meta_title:   r.meta_title ?? "",
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

function parseRadarLeads(rows: string[][]): RadarLead[] {
  return rowsToObjects(rows).map((r) => ({
    radar_id:        r.radar_id ?? "",
    phone:           r.phone ?? "",
    name:            r.name ?? "",
    source:          r.source ?? "",
    detected_intent: r.detected_intent ?? "",
    score:           toNum(r.score),
    created_at:      r.created_at ?? "",
    notes:           r.notes ?? "",
  }));
}

function parseWhatsAppSessions(rows: string[][]): WhatsAppSession[] {
  return rowsToObjects(rows).map((r) => ({
    session_id:   r.session_id ?? "",
    phone:        r.phone ?? "",
    name:         r.name ?? "",
    last_message: r.last_message ?? "",
    status:       r.status ?? "",
    agent:        r.agent ?? "",
    started_at:   r.started_at ?? "",
    updated_at:   r.updated_at ?? "",
  }));
}

function parseSallaPages(rows: string[][]): SallaPage[] {
  return rowsToObjects(rows).map((r) => ({
    page_id:         r.page_id ?? "",
    title:           r.title ?? "",
    url:             r.url ?? "",
    status:          r.status ?? "",
    views:           toNum(r.views),
    conversion_rate: toNum(r.conversion_rate),
    last_updated:    r.last_updated ?? "",
  }));
}

// ─── دالة جلب ورقة واحدة ─────────────────────────────────────────────────────

async function fetchSheet(sheetName: string): Promise<string[][]> {
  // نستخدم gviz/tq CSV — يعمل بدون API Key إذا الشيت مشارك للعموم
  const encodedName = encodeURIComponent(sheetName);
  const url = `https://docs.google.com/spreadsheets/d/${SHEETS_ID}/gviz/tq?tqx=out:csv&sheet=${encodedName}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`فشل جلب ورقة ${sheetName}: ${res.status} — تأكد أن الشيت مشارك للعموم`);
  }

  const csv = await res.text();

  // تحويل CSV إلى مصفوفة صفوف
  const rows: string[][] = [];
  const lines = csv.split("\n");

  for (const line of lines) {
    if (!line.trim()) continue;
    // تحليل CSV مع دعم الحقول التي تحتوي فواصل داخل علامات اقتباس
    const cols: string[] = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === "," && !inQuotes) {
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
}

// ─── Hook الرئيسي ─────────────────────────────────────────────────────────────

export function useGoogleSheets(
  options: { autoRefresh?: boolean; intervalMs?: number } = {}
): SheetsState {
  const { autoRefresh = false, intervalMs = 60_000 } = options;

  const [data, setData]       = useState<SheetsData>(EMPTY_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    // إذا لم يُضبط SHEETS_ID — أعد بيانات فارغة بدون خطأ
    if (!SHEETS_ID) {
      setError("⚠️ VITE_SHEETS_ID غير مضبوط. راجع إعدادات Vercel.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // جلب جميع الأوراق بالتوازي
      const [
        leadsRows,
        inventoryRows,
        ordersRows,
        deliveriesRows,
        salesTasksRows,
        customerServiceRows,
        dailyReportsRows,
        socialPostsRows,
        contentRows,
        radarLeadsRows,
        whatsappSessionsRows,
        sallaPagesRows,
      ] = await Promise.all([
        fetchSheet(SHEET_NAMES.leads),
        fetchSheet(SHEET_NAMES.inventory),
        fetchSheet(SHEET_NAMES.orders),
        fetchSheet(SHEET_NAMES.deliveries),
        fetchSheet(SHEET_NAMES.salesTasks),
        fetchSheet(SHEET_NAMES.customerService),
        fetchSheet(SHEET_NAMES.dailyReports),
        fetchSheet(SHEET_NAMES.socialPosts),
        fetchSheet(SHEET_NAMES.content),
        fetchSheet(SHEET_NAMES.radarLeads),
        fetchSheet(SHEET_NAMES.whatsappSessions),
        fetchSheet(SHEET_NAMES.sallaPages),
      ]);

      setData({
        leads:            parseLeads(leadsRows),
        inventory:        parseInventory(inventoryRows),
        orders:           parseOrders(ordersRows),
        deliveries:       parseDeliveries(deliveriesRows),
        salesTasks:       parseSalesTasks(salesTasksRows),
        customerService:  parseCustomerService(customerServiceRows),
        dailyReports:     parseDailyReports(dailyReportsRows),
        socialPosts:      parseSocialPosts(socialPostsRows),
        content:          parseContent(contentRows),
        radarLeads:       parseRadarLeads(radarLeadsRows),
        whatsappSessions: parseWhatsAppSessions(whatsappSessionsRows),
        sallaPages:       parseSallaPages(sallaPagesRows),
        lastUpdated:      new Date().toISOString(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطأ غير معروف");
    } finally {
      setLoading(false);
    }
  }, []);

  // جلب أولي عند التحميل
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // تحديث تلقائي دوري (اختياري)
  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(fetchAll, intervalMs);
    return () => clearInterval(id);
  }, [autoRefresh, intervalMs, fetchAll]);

  return { data, loading, error, refetch: fetchAll };
}

// ─── دوال مساعدة للإحصائيات ──────────────────────────────────────────────────

export function computeSummary(data: SheetsData) {
  const realLeads   = data.leads.filter((l) => !l.is_demo);
  const hotLeads    = realLeads.filter((l) => l.category === "hot");
  const totalOrders = data.orders.length;
  const totalValue  = data.orders.reduce((s, o) => s + o.total, 0);

  const delivered       = data.deliveries.filter((d) => d.status === "delivered").length;
  const deliveryRate    = data.deliveries.length
    ? Math.round((delivered / data.deliveries.length) * 100)
    : 0;

  const openTasks   = data.salesTasks.filter((t) => t.task_status === "open").length;
  const avgScore    = realLeads.length
    ? Math.round(realLeads.reduce((s, l) => s + l.final_score, 0) / realLeads.length)
    : 0;

  const published   = data.content.filter((c) => c.status === "published").length;
  const pending     = data.content.filter((c) => c.status === "pending_upload").length;
  const avgSeo      = data.content.length
    ? Math.round(data.content.reduce((s, c) => s + c.seo_score, 0) / data.content.length)
    : 0;

  const urgentCS       = data.customerService.filter((c) => c.needs_human).length;
  const totalInventory = data.inventory.length;
  const lowStock       = data.inventory.filter((i) => i.quantity_available < 10).length;
  const totalRevenue   = data.dailyReports.reduce((s, r) => s + r.total_revenue, 0);
  const activeSessions = data.whatsappSessions.filter((s) => s.status === "active").length;
  const publishedPages = data.sallaPages.filter((p) => p.status === "published").length;
  const scheduledPosts = data.socialPosts.filter((p) => p.status === "scheduled").length;
  const radarHot       = data.radarLeads.filter((r) => r.score >= 80).length;

  return {
    totalLeads:      realLeads.length,
    hotLeads:        hotLeads.length,
    totalOrders,
    totalValue,
    deliveryRate,
    openTasks,
    avgScore,
    publishedContent: published,
    pendingContent:   pending,
    avgSeoScore:      avgSeo,
    urgentCS,
    warmLeads:       realLeads.filter((l) => l.category === "warm").length,
    coolLeads:       realLeads.filter((l) => l.category === "cool").length,
    coldLeads:       realLeads.filter((l) => l.category === "cold").length,
    totalInventory,
    lowStock,
    totalRevenue,
    activeSessions,
    publishedPages,
    scheduledPosts,
    radarHot,
  };
}
