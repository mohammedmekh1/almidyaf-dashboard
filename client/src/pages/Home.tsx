import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  Users, TrendingUp, ShoppingCart, Truck, RefreshCw,
  Zap, FileText, MessageSquare, Star, AlertCircle,
  CheckCircle, Clock, Loader2, Package, ChevronUp, ChevronDown,
} from "lucide-react";
import { useSheets } from "@/contexts/SheetsContext";
import DashboardLayout from "@/components/DashboardLayout";
import type { Lead, Order, SalesTask, CustomerService, Content } from "@/hooks/useGoogleSheets";

const PRODUCT_LABELS: Record<string, string> = {
  full_carcass:      "ذبيحة كاملة",
  half_carcass:      "نصف ذبيحة",
  quarter_carcass:   "ربع ذبيحة",
  live_sheep:        "خروف حي",
  kg_meat:           "لحم بالكيلو",
  slaughter_service: "خدمة الذبح",
  events_catering:   "خدمة الحفلات",
  eid_adha:          "أضحية العيد",
  bulk_order:        "طلب بالجملة",
};

const CATEGORY_COLORS: Record<string, string> = {
  hot:  "#8B1E1E",
  warm: "#C9A227",
  cool: "#5B7A99",
  cold: "#9CA3AF",
};

const CATEGORY_LABELS: Record<string, string> = {
  hot:  "ساخن",
  warm: "دافئ",
  cool: "بارد",
  cold: "بارد جداً",
};

const fmt = (n: number) => n.toLocaleString("ar-SA");
const fmtTime = (iso: string) => {
  try { return new Date(iso).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }); }
  catch { return iso; }
};
const fmtDate = (iso: string) => {
  try { return new Date(iso).toLocaleDateString("ar-SA", { month: "short", day: "numeric" }); }
  catch { return iso; }
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KPI({
  icon, title, value, sub, color = "#8B1E1E", trend,
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  sub?: string;
  color?: string;
  trend?: "up" | "down" | "neutral";
}) {
  return (
    <Card className="border-border/60 shadow-sm hover:shadow-md transition-all duration-200">
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl shrink-0" style={{ background: color + "18" }}>
            <div style={{ color }}>{icon}</div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground font-semibold truncate">{title}</p>
            <div className="flex items-end gap-2 mt-1">
              <span className="text-2xl font-black leading-none font-num" style={{ color }}>
                {value}
              </span>
              {trend && (
                <span className={`text-xs mb-0.5 ${trend === "up" ? "text-green-600" : trend === "down" ? "text-red-500" : "text-muted-foreground"}`}>
                  {trend === "up" ? <ChevronUp size={14} /> : trend === "down" ? <ChevronDown size={14} /> : null}
                </span>
              )}
            </div>
            {sub && <p className="text-xs text-muted-foreground mt-1 truncate">{sub}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Loading / Error ──────────────────────────────────────────────────────────

function Loading() {
  return (
    <DashboardLayout>
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin size-10" style={{ color: "#8B1E1E" }} />
          <p className="text-muted-foreground">جاري تحميل البيانات…</p>
        </div>
      </div>
    </DashboardLayout>
  );
}

function ErrorView({ msg, retry }: { msg: string; retry: () => void }) {
  return (
    <DashboardLayout>
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full border-destructive/30">
          <CardContent className="p-8 flex flex-col items-center gap-4 text-center">
            <AlertCircle className="size-12 text-destructive" />
            <div>
              <p className="font-bold text-lg">تعذّر تحميل البيانات</p>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{msg}</p>
            </div>
            <Button onClick={retry} variant="outline" className="gap-2">
              <RefreshCw size={15} /> إعادة المحاولة
            </Button>
            <p className="text-xs text-muted-foreground">
              تأكّد أن الشيت مشارك للعموم (Anyone with link → Viewer)
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

// ─── Category Badge ───────────────────────────────────────────────────────────

function CatBadge({ cat }: { cat: string }) {
  const c = CATEGORY_COLORS[cat] || "#9CA3AF";
  return (
    <span className="inline-block px-2 py-0.5 rounded text-xs font-bold text-white"
          style={{ background: c }}>
      {CATEGORY_LABELS[cat] || cat}
    </span>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const [filter, setFilter] = useState<"today" | "week" | "month" | "all">("all");
  const { data, summary, loading, error, refetch } = useSheets();

  if (loading) return <Loading />;
  if (error)   return <ErrorView msg={error} retry={refetch} />;

  const now = new Date();
  const withinMs = (iso: string, ms: number) => {
    try { return (now.getTime() - new Date(iso).getTime()) < ms; }
    catch { return false; }
  };
  const filterDate = (iso: string) => {
    if (filter === "all" || !iso) return true;
    if (filter === "today") return new Date(iso).toDateString() === now.toDateString();
    if (filter === "week")  return withinMs(iso, 7  * 86400000);
    if (filter === "month") return withinMs(iso, 30 * 86400000);
    return true;
  };

  const fLeads  = data.leads.filter((l) => !l.is_demo && filterDate(l.created_at));
  const fOrders = data.orders.filter((o) => filterDate(o.created_at));

  // رسوم بيانية
  const catData = (["hot","warm","cool","cold"] as const)
    .map((c) => ({ name: CATEGORY_LABELS[c], value: fLeads.filter((l) => l.category === c).length, fill: CATEGORY_COLORS[c] }))
    .filter((d) => d.value > 0);

  const prodCount: Record<string, number> = {};
  fLeads.forEach((l) => {
    const label = PRODUCT_LABELS[l.detected_product] || l.detected_product || "غير محدد";
    prodCount[label] = (prodCount[label] || 0) + 1;
  });
  const prodData = Object.entries(prodCount)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  // آخر 7 أيام
  const timeData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const label = d.toLocaleDateString("ar-SA", { weekday: "short" });
    const leads  = data.leads.filter((l) => !l.is_demo && new Date(l.created_at).toDateString() === d.toDateString()).length;
    const orders = data.orders.filter((o) => new Date(o.created_at).toDateString() === d.toDateString()).length;
    return { date: label, leads, orders };
  });

  const srcCount: Record<string, number> = {};
  fLeads.forEach((l) => {
    const s = l.platform || l.source || "غير معروف";
    srcCount[s] = (srcCount[s] || 0) + 1;
  });
  const srcData = Object.entries(srcCount)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  return (
    <DashboardLayout>
      <div className="p-5 md:p-7 max-w-[1400px] mx-auto">

        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-7">
          <div>
            <h1 className="text-2xl md:text-3xl font-black" style={{ color: "#8B1E1E" }}>
              لوحة لحوم المضياف
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              نظرة شاملة — بيانات مباشرة من Google Sheets
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {(["today","week","month","all"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-all"
                style={filter === f
                  ? { background: "#8B1E1E", color: "#fff" }
                  : { background: "var(--secondary)", color: "var(--foreground)" }
                }>
                {{today:"اليوم",week:"أسبوع",month:"شهر",all:"الكل"}[f]}
              </button>
            ))}
            <Button onClick={refetch} variant="outline" size="sm" className="gap-2">
              <RefreshCw size={14} /> تحديث
            </Button>
            {data.lastUpdated && (
              <span className="text-xs text-muted-foreground hidden md:block">
                آخر تحديث {fmtTime(data.lastUpdated)}
              </span>
            )}
          </div>
        </div>

        {/* ── KPIs ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-7">
          <KPI icon={<Users size={18}/>}       title="إجمالي العملاء"   value={summary.totalLeads}     sub={`${summary.hotLeads} ساخن`}       color="#8B1E1E" />
          <KPI icon={<Zap size={18}/>}         title="عملاء ساخنون"    value={summary.hotLeads}       sub="أولوية قصوى"                       color="#8B1E1E" />
          <KPI icon={<ShoppingCart size={18}/>} title="الطلبات"        value={summary.totalOrders}    sub={`${fmt(summary.totalValue)} ر.س`}  color="#C9A227" />
          <KPI icon={<Truck size={18}/>}        title="معدل التسليم"   value={`${summary.deliveryRate}%`} sub="من الإجمالي"                  color="#1E8B4E" />
          <KPI icon={<Clock size={18}/>}        title="مهام مفتوحة"    value={summary.openTasks}      sub={`${summary.escalatedTasks} عاجلة`} color="#E08A1E" />
          <KPI icon={<Star size={18}/>}         title="متوسط الدرجة"   value={summary.avgScore}       sub="من 100"                            color="#C9A227" />
          <KPI icon={<MessageSquare size={18}/>} title="استفسارات عاجلة" value={summary.urgentCS}    sub="تحتاج مندوب"                       color="#8B1E1E" />
          <KPI icon={<FileText size={18}/>}     title="مقالات منشورة"  value={summary.publishedContent} sub={`SEO ${summary.avgSeoScore}`}   color="#5B7A99" />
          <KPI icon={<Package size={18}/>}      title="منتجات ناقصة"   value={summary.lowStock}       sub="تحتاج تعبئة"                       color="#E08A1E" />
          <KPI icon={<TrendingUp size={18}/>}   title="الإيرادات الكلية" value={`${fmt(summary.totalRevenue)} ر.س`} sub="من التقارير"        color="#1E8B4E" />
        </div>

        {/* ── Charts Row 1 ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
          {/* منحنى 7 أيام */}
          <Card className="lg:col-span-2 border-border/60 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold">العملاء والطلبات — آخر 7 أيام</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={timeData}>
                  <defs>
                    <linearGradient id="gL" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B1E1E" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#8B1E1E" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="gO" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C9A227" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#C9A227" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8E3DC"/>
                  <XAxis dataKey="date" stroke="#9CA3AF" fontSize={11}/>
                  <YAxis stroke="#9CA3AF" fontSize={11} allowDecimals={false}/>
                  <Tooltip contentStyle={{ borderRadius:8, fontFamily:"Cairo", fontSize:12 }}/>
                  <Legend wrapperStyle={{ fontFamily:"Cairo", fontSize:12 }}/>
                  <Area type="monotone" dataKey="leads"  stroke="#8B1E1E" fill="url(#gL)" strokeWidth={2} name="عملاء"/>
                  <Area type="monotone" dataKey="orders" stroke="#C9A227" fill="url(#gO)" strokeWidth={2} name="طلبات"/>
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Pie التصنيفات */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold">توزيع العملاء</CardTitle>
            </CardHeader>
            <CardContent>
              {catData.length === 0 ? (
                <div className="h-[260px] flex items-center justify-center text-muted-foreground text-sm">
                  لا توجد بيانات
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={catData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                           paddingAngle={3} dataKey="value">
                        {catData.map((e, i) => <Cell key={i} fill={e.fill}/>)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius:8, fontFamily:"Cairo", fontSize:12 }}/>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-2 justify-center mt-2">
                    {catData.map((d) => (
                      <div key={d.name} className="flex items-center gap-1.5 text-xs">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.fill }}/>
                        <span className="text-muted-foreground">{d.name}: <span className="font-bold text-foreground">{d.value}</span></span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Charts Row 2 ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          {/* أكثر المنتجات */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold">أكثر المنتجات طلباً</CardTitle>
            </CardHeader>
            <CardContent>
              {prodData.length === 0 ? (
                <div className="h-[240px] flex items-center justify-center text-muted-foreground text-sm">لا توجد بيانات</div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={prodData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8E3DC"/>
                    <XAxis type="number" stroke="#9CA3AF" fontSize={11} allowDecimals={false}/>
                    <YAxis dataKey="name" type="category" stroke="#9CA3AF" width={100} fontSize={11}/>
                    <Tooltip contentStyle={{ borderRadius:8, fontFamily:"Cairo", fontSize:12 }}/>
                    <Bar dataKey="value" fill="#C9A227" radius={[0,6,6,0]} name="الطلبات"/>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* مصادر العملاء */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold">مصادر العملاء</CardTitle>
            </CardHeader>
            <CardContent>
              {srcData.length === 0 ? (
                <div className="h-[240px] flex items-center justify-center text-muted-foreground text-sm">لا توجد بيانات</div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={srcData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8E3DC"/>
                    <XAxis dataKey="name" stroke="#9CA3AF" fontSize={10}/>
                    <YAxis stroke="#9CA3AF" fontSize={11} allowDecimals={false}/>
                    <Tooltip contentStyle={{ borderRadius:8, fontFamily:"Cairo", fontSize:12 }}/>
                    <Bar dataKey="value" fill="#8B1E1E" radius={[6,6,0,0]} name="العملاء"/>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── جداول ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          {/* العملاء الساخنون */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"/>
                آخر العملاء الساخنين
              </CardTitle>
            </CardHeader>
            <CardContent>
              {fLeads.filter((l) => l.category === "hot").length === 0 ? (
                <p className="text-center text-muted-foreground text-sm py-8">لا يوجد عملاء ساخنون</p>
              ) : (
                <div className="overflow-x-auto -mx-1">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/60">
                        <th className="text-right py-2 px-2 text-xs font-bold text-muted-foreground">الاسم</th>
                        <th className="text-right py-2 px-2 text-xs font-bold text-muted-foreground">المنتج</th>
                        <th className="text-right py-2 px-2 text-xs font-bold text-muted-foreground">الدرجة</th>
                        <th className="text-right py-2 px-2 text-xs font-bold text-muted-foreground">المصدر</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fLeads.filter((l: Lead) => l.category === "hot").slice(0, 8).map((l: Lead) => (
                        <tr key={l.lead_id} className="border-b border-border/40 hover:bg-secondary/30 transition-colors">
                          <td className="py-2 px-2 font-semibold">{l.name || "—"}</td>
                          <td className="py-2 px-2 text-xs text-muted-foreground">
                            {PRODUCT_LABELS[l.detected_product] || l.detected_product || "—"}
                          </td>
                          <td className="py-2 px-2">
                            <span className="px-2 py-0.5 rounded text-xs font-bold text-white"
                                  style={{ background: "#8B1E1E" }}>
                              {l.final_score}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-xs text-muted-foreground">{l.platform || l.source || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* المهام العاجلة */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold">المهام العاجلة</CardTitle>
            </CardHeader>
            <CardContent>
              {data.salesTasks.filter((t) => t.task_status !== "closed").length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8">
                  <CheckCircle className="size-8 text-green-500"/>
                  <p className="text-muted-foreground text-sm">لا توجد مهام مفتوحة 🎉</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {data.salesTasks.filter((t: SalesTask) => t.task_status !== "closed").slice(0, 6).map((t: SalesTask) => (
                    <div key={t.task_id} className="p-3 border border-border/60 rounded-xl hover:shadow-sm transition-shadow">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{t.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{t.product_label} · {t.action_required}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold text-white shrink-0 ${
                          t.task_status === "escalated" ? "bg-red-600" : "bg-orange-500"
                        }`}>
                          {t.task_status === "escalated" ? "عاجل" : "مفتوح"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── آخر الطلبات + خدمة العملاء ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <ShoppingCart size={16}/> آخر الطلبات
              </CardTitle>
            </CardHeader>
            <CardContent>
              {fOrders.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm py-8">لا توجد طلبات</p>
              ) : (
                <div className="space-y-2">
                  {fOrders.slice(0, 6).map((o: Order) => (
                    <div key={o.order_id} className="flex items-center justify-between p-2.5 border border-border/50 rounded-xl">
                      <div>
                        <p className="font-semibold text-sm">{o.customer_name}</p>
                        <p className="text-xs text-muted-foreground">{o.main_product}</p>
                      </div>
                      <div className="text-left shrink-0">
                        <p className="font-black text-sm font-num" style={{ color:"#8B1E1E" }}>
                          {fmt(o.total)} {o.currency}
                        </p>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          o.status === "delivered"  ? "bg-green-100 text-green-700" :
                          o.status === "processing" ? "bg-yellow-100 text-yellow-700" :
                          o.status === "pending"    ? "bg-orange-100 text-orange-700" :
                          "bg-gray-100 text-gray-600"
                        }`}>
                          {o.status === "delivered" ? "مُسلَّم" :
                           o.status === "processing"? "قيد التجهيز" :
                           o.status === "pending"   ? "قيد الانتظار" : o.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <MessageSquare size={16}/> استفسارات العملاء
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.customerService.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm py-8">لا توجد استفسارات</p>
              ) : (
                <div className="space-y-2.5">
                  {data.customerService.slice(0, 5).map((cs: CustomerService) => (
                    <div key={cs.cs_id} className="p-3 border border-border/50 rounded-xl">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-sm">{cs.name}</p>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold text-white shrink-0 ${
                          cs.needs_human ? "bg-red-600" : "bg-blue-500"
                        }`}>
                          {cs.needs_human ? "يحتاج مندوب" : "آلي"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{cs.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{cs.channel} · {fmtDate(cs.received_at)}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── المحتوى SEO ── */}
        <Card className="border-border/60 shadow-sm mb-5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <FileText size={16}/> إحصائيات المحتوى SEO
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { label:"منشورة", val:summary.publishedContent, cls:"bg-green-50 text-green-700" },
                { label:"قيد الانتظار", val:summary.pendingContent, cls:"bg-yellow-50 text-yellow-700" },
                { label:"متوسط SEO", val:summary.avgSeoScore, cls:"bg-blue-50 text-blue-700" },
              ].map((s) => (
                <div key={s.label} className={`text-center p-3 rounded-xl ${s.cls}`}>
                  <p className="text-2xl font-black font-num">{s.val}</p>
                  <p className="text-xs mt-0.5 font-semibold">{s.label}</p>
                </div>
              ))}
            </div>
            {data.content.length > 0 && (
              <div className="space-y-2">
                {data.content.filter((c: Content) => c.status === "published").slice(0, 4).map((c: Content) => (
                  <div key={c.article_id} className="flex items-center justify-between border-b border-border/40 pb-2 last:border-0">
                    <p className="text-sm font-medium flex-1 truncate pl-4">{c.meta_title}</p>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        c.seo_score >= 85 ? "bg-green-100 text-green-700" :
                        c.seo_score >= 70 ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                      }`}>SEO {c.seo_score}</span>
                      <span className="text-xs text-muted-foreground">{fmtDate(c.published_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground py-4">
          لوحة المضياف · بيانات من Google Sheets
          {data.lastUpdated ? ` · آخر تحديث ${fmtTime(data.lastUpdated)}` : ""}
        </p>
      </div>
    </DashboardLayout>
  );
}
