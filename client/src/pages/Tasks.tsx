import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useSheets } from "@/contexts/SheetsContext";
import { Loader2, Phone, MessageCircle, ExternalLink, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { useState } from "react";

const PRODUCT_LABELS: Record<string,string> = {
  full_carcass:"ذبيحة كاملة", half_carcass:"نصف ذبيحة",
  quarter_carcass:"ربع ذبيحة", live_sheep:"خروف حي",
  kg_meat:"لحم بالكيلو", slaughter_service:"خدمة ذبح",
  events_catering:"خدمة حفلات", eid_adha:"أضحية عيد",
  bulk_order:"طلب بالجملة",
};

export default function Tasks() {
  const { data, loading } = useSheets();
  const [status, setStatus] = useState<"all"|"open"|"escalated"|"closed">("all");
  const [selected, setSelected] = useState<any>(null);

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin size-8" style={{ color:"#FF6200" }}/>
      </div>
    </DashboardLayout>
  );

  const tasks = data.salesTasks.filter((t) =>
    status === "all" || t.task_status === status
  );

  const openCount      = data.salesTasks.filter(t => t.task_status === "open").length;
  const escalatedCount = data.salesTasks.filter(t => t.task_status === "escalated").length;
  const closedCount    = data.salesTasks.filter(t => t.task_status === "closed").length;

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 max-w-[1400px] mx-auto">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label:"مفتوحة", val:openCount,      color:"#E08A1E", icon:<Clock size={16}/> },
            { label:"عاجلة",  val:escalatedCount,  color:"#C0392B", icon:<AlertTriangle size={16}/> },
            { label:"مغلقة",  val:closedCount,     color:"#15803D", icon:<CheckCircle size={16}/> },
          ].map(s => (
            <div key={s.label} className="p-3 rounded-xl border border-border bg-white text-center">
              <div className="flex justify-center mb-1" style={{ color:s.color }}>{s.icon}</div>
              <p className="text-2xl font-black font-num" style={{ color:s.color }}>{s.val}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-black" style={{ color:"#FF6200" }}>مهام المبيعات</h1>
          <div className="flex gap-2">
            {(["all","open","escalated","closed"] as const).map(s => (
              <button key={s} onClick={() => setStatus(s)}
                      className="px-3 py-1 rounded-lg text-xs font-semibold transition-all"
                      style={status===s ? {background:"#FF6200",color:"#fff"} : {background:"var(--secondary)",color:"var(--foreground)"}}>
                {s==="all"?"الكل":s==="open"?"مفتوحة":s==="escalated"?"عاجلة":"مغلقة"}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* القائمة */}
          <div className="lg:col-span-2 space-y-2">
            {tasks.map((t) => (
              <div key={t.task_id}
                   onClick={() => setSelected(t)}
                   className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
                     selected?.task_id === t.task_id
                       ? "border-orange-400 bg-orange-50"
                       : "border-border bg-white hover:border-orange-300"
                   }`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm">{t.name || "—"}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold text-white ${
                        t.task_status === "escalated" ? "bg-red-600" :
                        t.task_status === "open"      ? "bg-orange-500" : "bg-green-600"
                      }`}>
                        {t.task_status === "escalated" ? "🚨 عاجل" : t.task_status === "open" ? "🔓 مفتوح" : "✅ مغلق"}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      {t.phone && (
                        <span className="flex items-center gap-1 font-medium text-green-700">
                          <Phone size={11}/> {t.phone}
                        </span>
                      )}
                      <span>{PRODUCT_LABELS[t.product_label] || t.product_label || "—"}</span>
                      <span>SLA: {t.sla_minutes} د</span>
                      <span className="font-bold" style={{ color:"#FF6200" }}>{t.score}/100</span>
                    </div>
                    {t.action_required && (
                      <p className="text-xs text-muted-foreground mt-1">{t.action_required}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    {t.phone && (
                      <a href={`https://wa.me/${t.phone.replace('+','')}`} target="_blank"
                         onClick={e => e.stopPropagation()}
                         className="flex items-center gap-1 px-2 py-1 bg-green-500 text-white rounded-lg text-xs font-bold hover:bg-green-600">
                        <MessageCircle size={11}/> واتساب
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {tasks.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <CheckCircle className="size-10 text-green-400 mx-auto mb-2"/>
                لا توجد مهام
              </div>
            )}
          </div>

          {/* التفاصيل */}
          <div>
            {selected ? (
              <Card className="border-border shadow-sm sticky top-4">
                <CardContent className="p-5">
                  <h3 className="font-black text-base mb-3">{selected.name}</h3>

                  {/* أزرار التواصل */}
                  <div className="space-y-2 mb-4">
                    {selected.phone && (
                      <>
                        <a href={`https://wa.me/${selected.phone.replace('+','')}`} target="_blank"
                           className="flex items-center justify-center gap-2 w-full py-2.5 bg-green-500 text-white rounded-xl font-bold text-sm">
                          <MessageCircle size={15}/> واتساب — {selected.phone}
                        </a>
                        <a href={`tel:${selected.phone}`}
                           className="flex items-center justify-center gap-2 w-full py-2.5 border border-green-400 text-green-700 rounded-xl font-bold text-sm">
                          <Phone size={15}/> اتصال مباشر
                        </a>
                      </>
                    )}
                    {selected.profile_url && (
                      <a href={selected.profile_url} target="_blank"
                         className="flex items-center justify-center gap-2 w-full py-2.5 bg-blue-500 text-white rounded-xl font-bold text-sm">
                        <ExternalLink size={15}/> الملف الشخصي
                      </a>
                    )}
                  </div>

                  <div className="space-y-2 text-sm">
                    {[
                      { label:"الدرجة",    val:`${selected.score}/100` },
                      { label:"الأولوية",  val:selected.priority },
                      { label:"SLA",       val:`${selected.sla_minutes} دقيقة` },
                      { label:"الإجراء",   val:selected.action_required },
                      { label:"الحالة",    val:selected.task_status },
                      { label:"التاريخ",   val:selected.created_at ? new Date(selected.created_at).toLocaleDateString("ar-SA") : null },
                    ].filter(r => r.val).map(r => (
                      <div key={r.label} className="flex justify-between py-1.5 border-b border-border/40 last:border-0">
                        <span className="text-muted-foreground text-xs">{r.label}</span>
                        <span className="font-semibold text-xs">{r.val}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground border border-dashed border-border rounded-xl">
                <p className="text-sm">انقر على مهمة لرؤية تفاصيلها</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
