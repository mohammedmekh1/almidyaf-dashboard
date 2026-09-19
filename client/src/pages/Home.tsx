import { useMemo, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertCircle, ArrowUpLeft, BarChart3, Check, ChevronDown, Clock3, Crown, Package, RefreshCw, Sparkles, Truck, Users, Wifi } from "lucide-react";
import { useSheets } from "@/contexts/SheetsContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const GOLD = "#B38E46";
const CRIMSON = "#C41228";
const money = (value: number) => `${Math.round(value).toLocaleString("ar-SA")} ر.س`;

function Metric({ icon: Icon, label, value, note, accent = GOLD }: { icon: typeof Crown; label: string; value: string | number; note: string; accent?: string }) {
  return <Card className="metric-card">
    <CardContent className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="metric-icon" style={{ color: accent, background: `${accent}12` }}><Icon size={20} /></div>
        <span className="metric-trend"><ArrowUpLeft size={12} /> 12.4%</span>
      </div>
      <p className="mt-5 text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{note}</p>
    </CardContent>
  </Card>;
}

function Loading() { return <DashboardLayout><div className="luxury-loading"><Sparkles size={28} /><p>جاري مزامنة غرفة القيادة...</p></div></DashboardLayout>; }
function ErrorView({ message, retry }: { message: string; retry: () => void }) { return <DashboardLayout><div className="luxury-loading"><AlertCircle size={30} color={CRIMSON} /><p>{message}</p><Button onClick={retry} className="mt-2">إعادة المحاولة</Button></div></DashboardLayout>; }

export default function Home() {
  const { data, summary, loading, error, refetch } = useSheets();
  const [range, setRange] = useState("آخر 7 أيام");
  const leadTrend = useMemo(() => Array.from({ length: 7 }, (_, index) => {
    const day = new Date(); day.setDate(day.getDate() - (6 - index));
    const key = day.toDateString();
    return { day: day.toLocaleDateString("ar-SA", { weekday: "short" }), value: data.leads.filter((lead) => !lead.is_demo && new Date(lead.created_at).toDateString() === key).length };
  }), [data.leads]);
  const channels = useMemo(() => Object.entries(data.leads.reduce<Record<string, number>>((acc, lead) => { const key = lead.platform || lead.source || "مباشر"; acc[key] = (acc[key] || 0) + 1; return acc; }, {})).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, value]) => ({ name, value })), [data.leads]);
  const recentOrders = data.orders.slice(-5).reverse();

  if (loading) return <Loading />;
  if (error) return <ErrorView message={error} retry={refetch} />;

  return <DashboardLayout>
    <div className="space-y-8">
      <section className="executive-hero">
        <div><div className="eyebrow"><Crown size={14} /> غرفة القيادة التنفيذية</div><h1>مرحباً بك في <span>مونتنيرو</span></h1><p>رؤية موحّدة لأداء متجر العطور الفاخرة عبر المملكة.</p></div>
        <div className="hero-actions"><div className="live-status"><span /> متصل بالمنظومة</div><Button variant="outline" className="luxury-button" onClick={refetch}><RefreshCw size={15} /> تحديث البيانات</Button><select aria-label="النطاق الزمني" value={range} onChange={(event) => setRange(event.target.value)} className="range-select"><option>آخر 7 أيام</option><option>آخر 30 يوماً</option><option>كل الفترة</option></select></div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Metric icon={BarChart3} label="إجمالي الإيرادات" value={money(summary.totalValue)} note="من الطلبات المسجلة" />
        <Metric icon={Users} label="قاعدة العملاء" value={summary.totalLeads.toLocaleString("ar-SA")} note={`${summary.hotLeads} عميل عالي النية`} accent={CRIMSON} />
        <Metric icon={Package} label="الطلبات المؤكدة" value={summary.totalOrders.toLocaleString("ar-SA")} note="تدفق الطلبات الحالي" />
        <Metric icon={Truck} label="معدل التسليم" value={`${summary.deliveryRate}%`} note="استقرار العمليات اللوجستية" accent={CRIMSON} />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[1.55fr_1fr] gap-5">
        <Card className="luxury-card"><CardHeader className="flex-row items-start justify-between"><div><p className="section-kicker">تحليل الاتجاه</p><CardTitle>تدفق العملاء المحتملين</CardTitle></div><div className="chart-legend"><span className="dot crimson" /> عملاء محتملون</div></CardHeader><CardContent><div className="h-[290px]"><ResponsiveContainer width="100%" height="100%"><AreaChart data={leadTrend} margin={{ top: 12, right: 0, left: -18, bottom: 0 }}><defs><linearGradient id="crimsonFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={CRIMSON} stopOpacity={0.24} /><stop offset="100%" stopColor={CRIMSON} stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="#eee8df" vertical={false} /><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#71717A", fontSize: 12 }} /><YAxis axisLine={false} tickLine={false} tick={{ fill: "#71717A", fontSize: 11 }} allowDecimals={false} /><Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #E8DCC4", fontFamily: "Cairo" }} /><Area type="monotone" dataKey="value" stroke={CRIMSON} fill="url(#crimsonFill)" strokeWidth={3} name="العملاء" /></AreaChart></ResponsiveContainer></div></CardContent></Card>
        <Card className="luxury-card"><CardHeader><p className="section-kicker">مصادر الاستقطاب</p><CardTitle>قنوات النمو</CardTitle></CardHeader><CardContent><div className="h-[290px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={channels} layout="vertical" margin={{ top: 0, right: 18, left: 12, bottom: 0 }}><CartesianGrid stroke="#eee8df" horizontal={false} /><XAxis type="number" hide /><YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={80} tick={{ fill: "#71717A", fontSize: 12 }} /><Tooltip cursor={{ fill: "#faf7f1" }} contentStyle={{ borderRadius: 10, border: "1px solid #E8DCC4", fontFamily: "Cairo" }} /><Bar dataKey="value" fill={GOLD} radius={[0, 6, 6, 0]} barSize={20} name="العملاء" /></BarChart></ResponsiveContainer></div></CardContent></Card>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[1.35fr_1fr] gap-5">
        <Card className="luxury-card"><CardHeader className="flex-row items-center justify-between"><div><p className="section-kicker">آخر الحركة</p><CardTitle>الطلبات الأخيرة</CardTitle></div><a href="/orders" className="text-sm text-primary hover:underline">عرض الكل</a></CardHeader><CardContent><div className="overflow-x-auto"><table className="luxury-table"><thead><tr><th>الطلب</th><th>العميل</th><th>القيمة</th><th>الحالة</th></tr></thead><tbody>{recentOrders.length ? recentOrders.map((order) => <tr key={order.order_id || order.order_number}><td className="font-semibold">{order.order_number || "—"}</td><td>{order.customer_name || "عميل مونتنيرو"}</td><td className="font-semibold">{money(order.total)}</td><td><span className="status-pill"><Check size={12} /> {order.status || "قيد المعالجة"}</span></td></tr>) : <tr><td colSpan={4} className="empty-row">لا توجد طلبات متاحة حالياً</td></tr>}</tbody></table></div></CardContent></Card>
        <Card className="luxury-card"><CardHeader><p className="section-kicker">نبض المنظومة</p><CardTitle>مؤشرات التشغيل</CardTitle></CardHeader><CardContent><div className="space-y-5"><div className="health-row"><div className="metric-icon small"><Wifi size={17} /></div><div><p>اتصال Google Sheets</p><span>مزامنة خادمية آمنة</span></div><strong>مستقر</strong></div><div className="health-row"><div className="metric-icon small"><Clock3 size={17} /></div><div><p>مهام المتابعة</p><span>تحتاج عناية الفريق</span></div><strong>{summary.openTasks}</strong></div><div className="health-row"><div className="metric-icon small"><Sparkles size={17} /></div><div><p>استوديو المحتوى</p><span>محتوى منشور</span></div><strong>{summary.publishedContent}</strong></div></div></CardContent></Card>
      </section>
      <p className="data-caption">آخر مزامنة: {data.lastUpdated ? new Date(data.lastUpdated).toLocaleString("ar-SA") : "بانتظار الاتصال"} · النطاق: {range}</p>
    </div>
  </DashboardLayout>;
}
