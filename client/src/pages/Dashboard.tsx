/**
 * Dashboard.tsx — لوحة إحصائيات لحوم المضياف
 * مربوطة بـ Google Sheets عبر useGoogleSheets hook
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie, Cell,
  FunnelChart, Funnel, LabelList,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Users, TrendingUp, ShoppingCart, Truck,
  RefreshCw, Zap, FileText, MessageSquare,
  Star, AlertCircle, CheckCircle, Clock,
  Loader2,
} from "lucide-react";
import {
  useGoogleSheets,
  computeSummary,
  type Lead,
  type Order,
  type SalesTask,
  type CustomerService,
  type Content,
} from "@/hooks/useGoogleSheets";

// ─── ثوابت ───────────────────────────────────────────────────────────────────

const PRODUCT_LABELS: Record<string, string> = {
  full_carcass:     "ذبيحة كاملة",
  half_carcass:     "نصف ذبيحة",
  quarter_carcass:  "ربع ذبيحة",
  live_sheep:       "خروف حي",
  kg_meat:          "لحم بالكيلو",
  slaughter_service:"خدمة الذبح",
  events_catering:  "خدمة الحفلات",
  eid_adha:         "أضحية العيد",
};

const CATEGORY_COLORS: Record<string, string> = {
  hot:  "#8B1E1E",
  warm: "#E08A1E",
  cool: "#5B7A99",
  cold: "#6B6B6B",
};

const formatDate = (iso: string) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("ar-SA", {
      year: "numeric", month: "long", day: "numeric",
    });
  } catch {
    return iso;
  }
};

// ─── بطاقة KPI ───────────────────────────────────────────────────────────────

function KPICard({
  icon, title, value, subtitle, color = "#8B1E1E",
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
}) {
  return (
    <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg" style={{ background: color + "18" }}>
            <div style={{ color }}>{icon}</div>
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground font-cairo">{title}</p>
            <p className="text-3xl font-bold text-foreground font-cairo mt-1" style={{ fontWeight: 800 }}>
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1 font-cairo">{subtitle}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── حالة التحميل والخطأ ─────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin size-10 text-primary" />
        <p className="text-muted-foreground font-cairo text-lg">
          جاري تحميل بيانات الشيت…
        </p>
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <Card className="max-w-lg w-full border-destructive/30">
        <CardContent className="p-8 flex flex-col items-center gap-4 text-center">
          <AlertCircle className="size-12 text-destructive" />
          <div>
            <p className="font-bold text-lg font-cairo text-foreground">تعذّر تحميل البيانات</p>
            <p className="text-sm text-muted-foreground mt-2 font-cairo leading-relaxed">{message}</p>
          </div>
          <Button onClick={onRetry} className="font-cairo">
            <RefreshCw className="size-4 ml-2" />
            إعادة المحاولة
          </Button>
          <p className="text-xs text-muted-foreground font-cairo">
            تأكد أن VITE_SHEETS_ID مضبوط وأن الشيت مشارك للعموم
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── المكوّن الرئيسي ──────────────────────────────────────────────────────────

export default function Dashboard() {
  const [dateFilter, setDateFilter] = useState<"today" | "week" | "month" | "all">("all");

  const { data, loading, error, refetch } = useGoogleSheets({
    autoRefresh: true,
    intervalMs:  120_000, // تحديث كل دقيقتين
  });

  if (loading) return <LoadingState />;
  if (error)   return <ErrorState message={error} onRetry={refetch} />;

  const summary = computeSummary(data);

  // ─── فلترة بالتاريخ ────────────────────────────────────────────────────────
  const now   = new Date();
  const filterByDate = (iso: string) => {
    if (dateFilter === "all" || !iso) return true;
    const d = new Date(iso);
    if (dateFilter === "today") return d.toDateString() === now.toDateString();
    if (dateFilter === "week")  return (now.getTime() - d.getTime()) < 7  * 86400000;
    if (dateFilter === "month") return (now.getTime() - d.getTime()) < 30 * 86400000;
    return true;
  };

  const filteredLeads  = data.leads.filter((l) => !l.is_demo && filterByDate(l.created_at));
  const filteredOrders = data.orders.filter((o) => filterByDate(o.created_at));

  // ─── بيانات الرسوم البيانية ────────────────────────────────────────────────

  // توزيع التصنيفات
  const categoryData = [
    { name: "ساخن",     value: filteredLeads.filter((l) => l.category === "hot").length,  fill: CATEGORY_COLORS.hot },
    { name: "دافئ",     value: filteredLeads.filter((l) => l.category === "warm").length, fill: CATEGORY_COLORS.warm },
    { name: "بارد",     value: filteredLeads.filter((l) => l.category === "cool").length, fill: CATEGORY_COLORS.cool },
    { name: "بارد جداً",value: filteredLeads.filter((l) => l.category === "cold").length, fill: CATEGORY_COLORS.cold },
  ].filter((d) => d.value > 0);

  // أكثر المنتجات طلباً
  const productCount: Record<string, number> = {};
  filteredLeads.forEach((l) => {
    const label = PRODUCT_LABELS[l.detected_product] || l.detected_product;
    productCount[label] = (productCount[label] || 0) + 1;
  });
  const productData = Object.entries(productCount)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  // العملاء عبر الزمن (آخر 7 أيام)
  const leadsOverTime: { date: string; leads: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString("ar-SA", { month: "short", day: "numeric" });
    const count = data.leads.filter((l) => {
      const ld = new Date(l.created_at);
      return ld.toDateString() === d.toDateString() && !l.is_demo;
    }).length;
    leadsOverTime.push({ date: label, leads: count });
  }

  // مسار التحويل
  const funnelData = [
    { name: "عملاء محتملون", value: filteredLeads.length },
    { name: "مُقيَّمون",     value: filteredLeads.filter((l) => l.status === "scored").length },
    { name: "مهام مبيعات",  value: data.salesTasks.length },
    { name: "طلبات",         value: filteredOrders.length },
    { name: "تسليم ناجح",   value: data.deliveries.filter((d) => d.status === "delivered").length },
  ];

  // مصادر العملاء
  const sourceCount: Record<string, number> = {};
  filteredLeads.forEach((l) => {
    sourceCount[l.platform || l.source] = (sourceCount[l.platform || l.source] || 0) + 1;
  });
  const sourceData = Object.entries(sourceCount)
    .map(([name, value]) => ({ name, value, fill: "#C9A227" }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-foreground font-cairo" style={{ fontWeight: 800 }}>
              🥩 لحوم المضياف
            </h1>
            <p className="text-sm text-muted-foreground mt-1 font-cairo">
              لوحة إحصائيات شاملة — مربوطة بـ Google Sheets
            </p>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as typeof dateFilter)}
              className="px-4 py-2 border border-border rounded-lg bg-card text-foreground font-cairo text-sm"
            >
              <option value="today">اليوم</option>
              <option value="week">آخر 7 أيام</option>
              <option value="month">آخر 30 يوم</option>
              <option value="all">الكل</option>
            </select>
            <Button onClick={refetch} variant="outline" className="font-cairo gap-2">
              <RefreshCw className="size-4" />
              تحديث
            </Button>
            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-green-700 font-cairo">متصل بالشيت</span>
            </div>
          </div>
        </div>
        {data.lastUpdated && (
          <p className="text-xs text-muted-foreground mt-3 font-cairo">
            آخر تحديث: {new Date(data.lastUpdated).toLocaleTimeString("ar-SA")}
          </p>
        )}
      </div>

      {/* ── KPI Cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-8">
        <KPICard icon={<Users size={20} />}       title="إجمالي العملاء"        value={summary.totalLeads}    subtitle={`${summary.hotLeads} ساخن`} color="#8B1E1E" />
        <KPICard icon={<Zap size={20} />}         title="ساخنون جاهزون"         value={summary.hotLeads}      subtitle="أولوية قصوى"                color="#8B1E1E" />
        <KPICard icon={<ShoppingCart size={20} />} title="إجمالي الطلبات"       value={summary.totalOrders}   subtitle={`${summary.totalValue.toLocaleString("ar-SA")} ر.س`} color="#C9A227" />
        <KPICard icon={<Truck size={20} />}       title="معدل التسليم"           value={`${summary.deliveryRate}%`} subtitle="من إجمالي التسليمات"  color="#1E8B4E" />
        <KPICard icon={<Clock size={20} />}       title="مهام مفتوحة"           value={summary.openTasks}     subtitle="تحتاج متابعة"               color="#E08A1E" />
        <KPICard icon={<Star size={20} />}        title="متوسط الدرجة"          value={summary.avgScore}      subtitle="من 100"                     color="#C9A227" />
        <KPICard icon={<MessageSquare size={20} />} title="استفسارات عاجلة"     value={summary.urgentCS}      subtitle="تحتاج مندوب"                color="#8B1E1E" />
        <KPICard icon={<FileText size={20} />}    title="مقالات منشورة"         value={summary.publishedContent} subtitle={`${summary.avgSeoScore} متوسط SEO`} color="#5B7A99" />
      </div>

      {/* ── Charts Row 1 ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* منحنى العملاء */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-cairo" style={{ fontWeight: 700 }}>
              العملاء الجدد — آخر 7 أيام
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={leadsOverTime}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#8B1E1E" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8B1E1E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                <XAxis dataKey="date" stroke="#6B6B6B" fontSize={11} />
                <YAxis stroke="#6B6B6B" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 8, fontFamily: "Cairo" }} />
                <Area type="monotone" dataKey="leads" stroke="#8B1E1E" fill="url(#grad)" strokeWidth={2} name="عملاء" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* توزيع التصنيفات */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-cairo" style={{ fontWeight: 700 }}>
              توزيع العملاء حسب التصنيف
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length === 0 ? (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground font-cairo">
                لا توجد بيانات
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={65} outerRadius={105}
                       paddingAngle={2} dataKey="value"
                       label={({ name, value }) => `${name}: ${value}`}
                       labelLine={false}>
                    {categoryData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, fontFamily: "Cairo" }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Charts Row 2 ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* أكثر المنتجات طلباً */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-cairo" style={{ fontWeight: 700 }}>
              أكثر المنتجات طلباً
            </CardTitle>
          </CardHeader>
          <CardContent>
            {productData.length === 0 ? (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground font-cairo">لا توجد بيانات</div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={productData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                  <XAxis type="number" stroke="#6B6B6B" fontSize={11} allowDecimals={false} />
                  <YAxis dataKey="name" type="category" stroke="#6B6B6B" width={110} fontSize={11} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontFamily: "Cairo" }} />
                  <Bar dataKey="value" fill="#C9A227" radius={[0, 6, 6, 0]} name="الطلبات" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* مسار التحويل */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-cairo" style={{ fontWeight: 700 }}>
              قمع التحويل
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <FunnelChart>
                <Tooltip contentStyle={{ borderRadius: 8, fontFamily: "Cairo" }} />
                <Funnel data={funnelData} dataKey="value" stroke="#8B1E1E" fill="#8B1E1E" fillOpacity={0.8}>
                  <LabelList dataKey="name" position="right" style={{ fontFamily: "Cairo", fontSize: 12 }} />
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ── مصادر العملاء ──────────────────────────────────────────────────── */}
      {sourceData.length > 0 && (
        <div className="mb-6">
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-cairo" style={{ fontWeight: 700 }}>
                مصادر العملاء المحتملين
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={sourceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                  <XAxis dataKey="name" stroke="#6B6B6B" fontSize={11} />
                  <YAxis stroke="#6B6B6B" fontSize={11} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontFamily: "Cairo" }} />
                  <Bar dataKey="value" fill="#8B1E1E" radius={[6, 6, 0, 0]} name="العملاء" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── جداول البيانات ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* العملاء الساخنون */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-cairo" style={{ fontWeight: 700 }}>
              آخر العملاء الساخنين
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredLeads.filter((l) => l.category === "hot").length === 0 ? (
              <p className="text-center text-muted-foreground font-cairo py-8">لا يوجد عملاء ساخنون</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-cairo">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-right py-2 px-2 font-semibold">الاسم</th>
                      <th className="text-right py-2 px-2 font-semibold">المنتج</th>
                      <th className="text-right py-2 px-2 font-semibold">الدرجة</th>
                      <th className="text-right py-2 px-2 font-semibold">القناة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads
                      .filter((l) => l.category === "hot")
                      .slice(0, 8)
                      .map((lead: Lead) => (
                        <tr key={lead.lead_id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                          <td className="py-2 px-2 font-medium">{lead.name || "—"}</td>
                          <td className="py-2 px-2 text-muted-foreground text-xs">
                            {PRODUCT_LABELS[lead.detected_product] || lead.detected_product}
                          </td>
                          <td className="py-2 px-2">
                            <span className="inline-block px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-semibold">
                              {lead.final_score}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-xs text-muted-foreground">
                            {lead.final_contact_channel}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* المهام العاجلة */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-cairo" style={{ fontWeight: 700 }}>
              المهام العاجلة
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.salesTasks.filter((t) => t.task_status !== "closed").length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8">
                <CheckCircle className="size-8 text-green-500" />
                <p className="text-muted-foreground font-cairo">لا توجد مهام مفتوحة 🎉</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.salesTasks
                  .filter((t: SalesTask) => t.task_status !== "closed")
                  .slice(0, 6)
                  .map((task: SalesTask) => (
                    <div key={task.task_id} className="p-3 border border-border/50 rounded-lg hover:shadow-sm transition-shadow">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-semibold font-cairo">{task.name}</p>
                          <p className="text-xs text-muted-foreground font-cairo mt-0.5">{task.product_label}</p>
                          <p className="text-xs text-muted-foreground font-cairo">{task.action_required}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-semibold text-white font-cairo ${
                          task.task_status === "escalated" ? "bg-red-600" : "bg-orange-500"
                        }`}>
                          {task.task_status === "escalated" ? "عاجل" : "مفتوح"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground font-cairo mt-1">
                        {task.assigned_to && `المسؤول: ${task.assigned_to}`}
                      </p>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── آخر الطلبات + خدمة العملاء ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* آخر الطلبات */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-cairo flex items-center gap-2" style={{ fontWeight: 700 }}>
              <ShoppingCart size={18} />
              آخر الطلبات
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredOrders.length === 0 ? (
              <p className="text-center text-muted-foreground font-cairo py-8">لا توجد طلبات</p>
            ) : (
              <div className="space-y-2">
                {filteredOrders.slice(0, 6).map((order: Order) => (
                  <div key={order.order_id} className="flex items-center justify-between p-3 border border-border/50 rounded-lg">
                    <div>
                      <p className="font-semibold font-cairo text-sm">{order.customer_name}</p>
                      <p className="text-xs text-muted-foreground font-cairo">{order.main_product}</p>
                    </div>
                    <div className="text-left">
                      <p className="font-bold font-cairo text-sm" style={{ color: "#8B1E1E" }}>
                        {order.total.toLocaleString("ar-SA")} {order.currency}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded font-cairo ${
                        order.status === "delivered"   ? "bg-green-100 text-green-700" :
                        order.status === "processing"  ? "bg-yellow-100 text-yellow-700" :
                        order.status === "pending"     ? "bg-orange-100 text-orange-700" :
                        "bg-gray-100 text-gray-600"
                      }`}>
                        {order.status === "delivered"  ? "مُسلَّم" :
                         order.status === "processing" ? "قيد التجهيز" :
                         order.status === "pending"    ? "قيد الانتظار" : order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* خدمة العملاء */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-cairo flex items-center gap-2" style={{ fontWeight: 700 }}>
              <MessageSquare size={18} />
              استفسارات خدمة العملاء
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.customerService.length === 0 ? (
              <p className="text-center text-muted-foreground font-cairo py-8">لا توجد استفسارات</p>
            ) : (
              <div className="space-y-3">
                {data.customerService.slice(0, 5).map((cs: CustomerService) => (
                  <div key={cs.cs_id} className="p-3 border border-border/50 rounded-lg">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-semibold font-cairo text-sm">{cs.name}</p>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold text-white font-cairo ${
                        cs.needs_human ? "bg-red-600" : "bg-blue-500"
                      }`}>
                        {cs.needs_human ? "يحتاج مندوب" : "آلي"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-cairo leading-relaxed line-clamp-2">
                      {cs.message}
                    </p>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-muted-foreground font-cairo">{cs.channel}</span>
                      <span className="text-xs text-muted-foreground font-cairo">{formatDate(cs.received_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── إحصائيات المحتوى ───────────────────────────────────────────────── */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-cairo flex items-center gap-2" style={{ fontWeight: 700 }}>
            <FileText size={18} />
            إحصائيات المحتوى SEO
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <p className="text-3xl font-bold text-green-700 font-cairo" style={{ fontWeight: 800 }}>
                {summary.publishedContent}
              </p>
              <p className="text-xs text-green-600 font-cairo mt-1">منشورة</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-xl">
              <p className="text-3xl font-bold text-yellow-700 font-cairo" style={{ fontWeight: 800 }}>
                {summary.pendingContent}
              </p>
              <p className="text-xs text-yellow-600 font-cairo mt-1">قيد الانتظار</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <p className="text-3xl font-bold text-blue-700 font-cairo" style={{ fontWeight: 800 }}>
                {summary.avgSeoScore}
              </p>
              <p className="text-xs text-blue-600 font-cairo mt-1">متوسط SEO</p>
            </div>
          </div>
          {data.content.length > 0 && (
            <div className="space-y-2">
              {data.content
                .filter((c: Content) => c.status === "published")
                .slice(0, 4)
                .map((article: Content) => (
                  <div key={article.article_id}
                       className="flex items-center justify-between border-b border-border/50 pb-2 last:border-0">
                    <p className="text-sm font-cairo font-medium flex-1 truncate pl-4">
                      {article.meta_title}
                    </p>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-xs font-cairo font-bold px-2 py-0.5 rounded ${
                        article.seo_score >= 85 ? "bg-green-100 text-green-700" :
                        article.seo_score >= 70 ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        SEO {article.seo_score}
                      </span>
                      <span className="text-xs text-muted-foreground font-cairo">
                        {formatDate(article.published_at)}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-xs text-muted-foreground font-cairo">
          لوحة المضياف • البيانات من Google Sheets •{" "}
          {data.lastUpdated
            ? `آخر تحديث ${new Date(data.lastUpdated).toLocaleTimeString("ar-SA")}`
            : "جاري التحميل…"}
        </p>
      </div>
    </div>
  );
}
