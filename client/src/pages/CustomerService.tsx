import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useSheets } from "@/contexts/SheetsContext";
import { Loader2, Phone, MessageCircle, AlertCircle, CheckCircle } from "lucide-react";
import { useState } from "react";

export default function CustomerService() {
  const { data, loading } = useSheets();
  const [filter, setFilter] = useState<"all"|"urgent"|"auto">("all");
  const [selected, setSelected] = useState<any>(null);

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin size-8" style={{ color:"#FF6200" }}/>
      </div>
    </DashboardLayout>
  );

  const cs = data.customerService.filter(c => {
    if (filter === "urgent") return c.needs_human;
    if (filter === "auto")   return !c.needs_human;
    return true;
  });

  const urgentCount = data.customerService.filter(c => c.needs_human).length;

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-black" style={{ color:"#FF6200" }}>خدمة العملاء</h1>
            {urgentCount > 0 && (
              <p className="text-sm text-red-600 font-semibold flex items-center gap-1">
                <AlertCircle size={13}/> {urgentCount} يحتاج مندوب فوراً
              </p>
            )}
          </div>
          <div className="flex gap-2">
            {(["all","urgent","auto"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                      className="px-3 py-1 rounded-lg text-xs font-semibold"
                      style={filter===f ? {background:"#FF6200",color:"#fff"} : {background:"var(--secondary)",color:"var(--foreground)"}}>
                {f==="all"?"الكل":f==="urgent"?"يحتاج مندوب":"آلي"}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-2">
            {cs.map((c) => (
              <div key={c.cs_id}
                   onClick={() => setSelected(c)}
                   className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
                     selected?.cs_id === c.cs_id ? "border-orange-400 bg-orange-50" : "border-border bg-white"
                   }`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm">{c.name || c.phone || "—"}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold text-white ${c.needs_human ? "bg-red-600" : "bg-blue-500"}`}>
                        {c.needs_human ? "🚨 يحتاج مندوب" : "🤖 آلي"}
                      </span>
                    </div>
                    {c.phone && (
                      <p className="text-xs text-green-700 font-medium flex items-center gap-1 mb-1">
                        <Phone size={11}/> {c.phone}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground line-clamp-2">{c.message}</p>
                  </div>
                  {c.phone && (
                    <a href={`https://wa.me/${c.phone.replace('+','')}`} target="_blank"
                       onClick={e => e.stopPropagation()}
                       className="flex items-center gap-1 px-2 py-1 bg-green-500 text-white rounded-lg text-xs font-bold shrink-0">
                      <MessageCircle size={11}/> واتساب
                    </a>
                  )}
                </div>
              </div>
            ))}
            {cs.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <CheckCircle className="size-10 text-green-400 mx-auto mb-2"/>
                لا توجد استفسارات
              </div>
            )}
          </div>

          <div>
            {selected ? (
              <Card className="border-border shadow-sm sticky top-4">
                <CardContent className="p-5">
                  <h3 className="font-black text-base mb-3">{selected.name || selected.phone}</h3>
                  {selected.phone && (
                    <div className="space-y-2 mb-4">
                      <a href={`https://wa.me/${selected.phone.replace('+','')}`} target="_blank"
                         className="flex items-center justify-center gap-2 w-full py-2.5 bg-green-500 text-white rounded-xl font-bold text-sm">
                        <MessageCircle size={15}/> واتساب — {selected.phone}
                      </a>
                      <a href={`tel:${selected.phone}`}
                         className="flex items-center justify-center gap-2 w-full py-2.5 border border-green-400 text-green-700 rounded-xl font-bold text-sm">
                        <Phone size={15}/> اتصال مباشر
                      </a>
                    </div>
                  )}
                  <div className="p-3 bg-secondary/60 rounded-xl mb-3">
                    <p className="text-xs font-bold text-muted-foreground mb-1">الرسالة</p>
                    <p className="text-xs leading-relaxed">{selected.message}</p>
                  </div>
                  {selected.ai_reply && (
                    <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                      <p className="text-xs font-bold text-blue-700 mb-1">رد AI</p>
                      <p className="text-xs leading-relaxed text-blue-800">{selected.ai_reply}</p>
                    </div>
                  )}
                  <div className="space-y-2 text-sm mt-3">
                    {[
                      { label:"القناة",   val:selected.channel },
                      { label:"النية",    val:selected.intent },
                      { label:"الوقت",    val:selected.received_at ? new Date(selected.received_at).toLocaleString("ar-SA") : null },
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
              <div className="flex items-center justify-center h-48 text-muted-foreground border border-dashed rounded-xl">
                <p className="text-sm">انقر على استفسار لرؤية تفاصيله</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
