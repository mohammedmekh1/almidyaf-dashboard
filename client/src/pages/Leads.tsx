import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useSheets } from "@/contexts/SheetsContext";
import { Loader2, ExternalLink, Phone, MessageCircle, Instagram, Twitter, Search } from "lucide-react";
import { useState } from "react";

const CAT_STYLES: Record<string, string> = {
  hot:  "bg-red-100 text-red-700 border border-red-200",
  warm: "bg-orange-100 text-orange-700 border border-orange-200",
  cool: "bg-blue-100 text-blue-700 border border-blue-200",
  cold: "bg-gray-100 text-gray-600 border border-gray-200",
};
const CAT_LABELS: Record<string, string> = { hot:"🔥 ساخن", warm:"🌡 دافئ", cool:"❄️ بارد", cold:"🧊 بارد جداً" };

const PRODUCT_LABELS: Record<string, string> = {
  full_carcass: "ذبيحة كاملة", half_carcass: "نصف ذبيحة",
  quarter_carcass: "ربع ذبيحة", live_sheep: "خروف حي",
  kg_meat: "لحم بالكيلو", slaughter_service: "خدمة ذبح",
  events_catering: "خدمة حفلات", eid_adha: "أضحية العيد",
  bulk_order: "طلب بالجملة",
};

const URGENCY_LABELS: Record<string, string> = {
  immediate: "🚨 فوري", soon: "⚡ قريب", planned: "📅 مخطط", unknown: "—"
};

export default function Leads() {
  const { data, loading } = useSheets();
  const [filter, setFilter] = useState<"all"|"hot"|"warm"|"cool"|"cold">("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<any>(null);

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin size-8" style={{ color:"#FF6200" }}/>
      </div>
    </DashboardLayout>
  );

  const leads = data.leads
    .filter((l) => !l.is_demo)
    .filter((l) => filter === "all" || l.category === filter)
    .filter((l) => {
      if (!search) return true;
      const s = search.toLowerCase();
      return (l.name||"").toLowerCase().includes(s) ||
             (l.phone||"").includes(s) ||
             (l.message||"").toLowerCase().includes(s);
    });

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 max-w-[1400px] mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-black" style={{ color:"#FF6200" }}>العملاء المحتملون</h1>
            <p className="text-sm text-muted-foreground">{leads.length} عميل</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-1.5 bg-white">
              <Search size={14} className="text-muted-foreground"/>
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="بحث بالاسم أو الهاتف..."
                className="outline-none text-sm w-40 bg-transparent"
              />
            </div>
            {(["all","hot","warm","cool","cold"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                      style={filter===f ? {background:"#FF6200",color:"#fff"} : {background:"var(--secondary)",color:"var(--foreground)"}}>
                {f==="all"?"الكل":CAT_LABELS[f]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* قائمة العملاء */}
          <div className="lg:col-span-2">
            <div className="space-y-2">
              {leads.map((l) => (
                <div key={l.lead_id}
                     onClick={() => setSelected(l)}
                     className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
                       selected?.lead_id === l.lead_id
                         ? "border-orange-400 bg-orange-50"
                         : "border-border bg-white hover:border-orange-300"
                     }`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm">{l.name || "—"}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${CAT_STYLES[l.category] || "bg-gray-100"}`}>
                          {CAT_LABELS[l.category] || l.category}
                        </span>
                        {l.urgency === "immediate" && (
                          <span className="px-1.5 py-0.5 bg-red-500 text-white rounded text-xs font-bold animate-pulse">فوري</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        {l.phone && (
                          <span className="flex items-center gap-1 font-medium text-green-700">
                            <Phone size={11}/> {l.phone}
                          </span>
                        )}
                        <span>{PRODUCT_LABELS[l.detected_product] || l.detected_product || "—"}</span>
                        <span>{l.location_hint || "—"}</span>
                        <span className="font-bold" style={{ color:"#FF6200" }}>{l.final_score}/100</span>
                      </div>
                      {l.message && (
                        <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                          {l.message.substring(0, 120)}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      {l.phone && (
                        <a href={`https://wa.me/${l.phone.replace('+','')}`} target="_blank"
                           onClick={e => e.stopPropagation()}
                           className="flex items-center gap-1 px-2 py-1 bg-green-500 text-white rounded-lg text-xs font-bold hover:bg-green-600 transition-colors">
                          <MessageCircle size={11}/> واتساب
                        </a>
                      )}
                      {l.profile_url && (
                        <a href={l.profile_url} target="_blank"
                           onClick={e => e.stopPropagation()}
                           className="flex items-center gap-1 px-2 py-1 bg-blue-500 text-white rounded-lg text-xs font-bold hover:bg-blue-600 transition-colors">
                          <ExternalLink size={11}/> الحساب
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {leads.length === 0 && (
                <div className="text-center py-16 text-muted-foreground">لا توجد عملاء</div>
              )}
            </div>
          </div>

          {/* بطاقة التفاصيل */}
          <div className="lg:col-span-1">
            {selected ? (
              <Card className="border-border shadow-sm sticky top-4">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-black text-base">{selected.name || "—"}</h3>
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${CAT_STYLES[selected.category] || ""}`}>
                      {CAT_LABELS[selected.category]}
                    </span>
                  </div>

                  {/* درجة كبيرة */}
                  <div className="text-center mb-4 p-3 rounded-xl"
                       style={{ background:"#FF620015" }}>
                    <p className="text-4xl font-black" style={{ color:"#FF6200" }}>
                      {selected.final_score}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">نقطة من 100</p>
                  </div>

                  {/* أزرار التواصل الفوري */}
                  <div className="space-y-2 mb-4">
                    {selected.phone && (
                      <>
                        <a href={`https://wa.me/${selected.phone.replace('+','')}`} target="_blank"
                           className="flex items-center justify-center gap-2 w-full py-2.5 bg-green-500 text-white rounded-xl font-bold text-sm hover:bg-green-600 transition-colors">
                          <MessageCircle size={15}/> واتساب — {selected.phone}
                        </a>
                        <a href={`tel:${selected.phone}`}
                           className="flex items-center justify-center gap-2 w-full py-2.5 border border-green-400 text-green-700 rounded-xl font-bold text-sm hover:bg-green-50 transition-colors">
                          <Phone size={15}/> اتصال مباشر
                        </a>
                      </>
                    )}
                    {selected.profile_url && (
                      <a href={selected.profile_url} target="_blank"
                         className="flex items-center justify-center gap-2 w-full py-2.5 bg-blue-500 text-white rounded-xl font-bold text-sm hover:bg-blue-600 transition-colors">
                        <ExternalLink size={15}/> الملف الشخصي
                      </a>
                    )}
                    {selected.post_url && (
                      <a href={selected.post_url} target="_blank"
                         className="flex items-center justify-center gap-2 w-full py-2.5 border border-blue-400 text-blue-700 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors">
                        <ExternalLink size={15}/> المنشور الأصلي
                      </a>
                    )}
                  </div>

                  {/* التفاصيل */}
                  <div className="space-y-2 text-sm">
                    {[
                      { label:"المنتج",    val: PRODUCT_LABELS[selected.detected_product] || selected.detected_product },
                      { label:"الكمية",    val: selected.quantity > 0 ? selected.quantity + " وحدة" : null },
                      { label:"الموقع",    val: selected.location_hint },
                      { label:"المنصة",    val: selected.platform || selected.source },
                      { label:"الإلحاحية", val: URGENCY_LABELS[selected.urgency] || selected.urgency },
                      { label:"القناة",    val: selected.final_contact_channel },
                      { label:"التوصيل",  val: selected.delivery_needed ? "✅ نعم" : "❌ لا" },
                      { label:"المناسبة",  val: selected.event_type !== "unknown" ? selected.event_type : null },
                      { label:"الميزانية", val: selected.budget_signal !== "unknown" ? selected.budget_signal : null },
                      { label:"التاريخ",  val: selected.created_at ? new Date(selected.created_at).toLocaleDateString("ar-SA") : null },
                    ].filter(r => r.val).map(r => (
                      <div key={r.label} className="flex justify-between items-start gap-2 py-1.5 border-b border-border/40 last:border-0">
                        <span className="text-muted-foreground text-xs">{r.label}</span>
                        <span className="font-semibold text-xs text-left">{r.val}</span>
                      </div>
                    ))}
                  </div>

                  {/* الرسالة */}
                  {selected.message && (
                    <div className="mt-3 p-3 bg-secondary/60 rounded-xl">
                      <p className="text-xs font-bold text-muted-foreground mb-1">الرسالة الأصلية</p>
                      <p className="text-xs leading-relaxed">{selected.message}</p>
                    </div>
                  )}

                  {/* ملاحظة AI */}
                  {selected.notes && (
                    <div className="mt-2 p-3 bg-orange-50 rounded-xl border border-orange-100">
                      <p className="text-xs font-bold text-orange-700 mb-1">تحليل AI</p>
                      <p className="text-xs text-orange-800 leading-relaxed">{selected.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground border border-dashed border-border rounded-xl">
                <p className="text-sm">انقر على عميل لرؤية تفاصيله</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
