import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useSheets } from "@/contexts/SheetsContext";
import { Loader2, Phone, MessageCircle, MapPin } from "lucide-react";
import { useState } from "react";

const STATUS_STYLES: Record<string,string> = {
  delivered:  "bg-green-100 text-green-700",
  processing: "bg-yellow-100 text-yellow-700",
  pending:    "bg-orange-100 text-orange-700",
  cancelled:  "bg-red-100 text-red-700",
};
const STATUS_LABELS: Record<string,string> = {
  delivered:"مُسلَّم", processing:"قيد التجهيز", pending:"قيد الانتظار", cancelled:"ملغي"
};

export default function Orders() {
  const { data, loading } = useSheets();
  const [selected, setSelected] = useState<any>(null);
  const [filter, setFilter] = useState("all");

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin size-8" style={{ color:"#FF6200" }}/>
      </div>
    </DashboardLayout>
  );

  const orders = data.orders.filter(o =>
    filter === "all" || o.status === filter
  );

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-black" style={{ color:"#FF6200" }}>الطلبات</h1>
            <p className="text-sm text-muted-foreground">
              {orders.length} طلب · {totalRevenue.toLocaleString("ar-SA")} ر.س
            </p>
          </div>
          <div className="flex gap-2">
            {["all","pending","processing","delivered"].map(s => (
              <button key={s} onClick={() => setFilter(s)}
                      className="px-3 py-1 rounded-lg text-xs font-semibold transition-all"
                      style={filter===s ? {background:"#FF6200",color:"#fff"} : {background:"var(--secondary)",color:"var(--foreground)"}}>
                {s==="all"?"الكل":STATUS_LABELS[s]||s}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-2">
            {orders.map((o) => (
              <div key={o.order_id}
                   onClick={() => setSelected(o)}
                   className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
                     selected?.order_id === o.order_id ? "border-orange-400 bg-orange-50" : "border-border bg-white"
                   }`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm">{o.customer_name}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${STATUS_STYLES[o.status] || "bg-gray-100 text-gray-600"}`}>
                        {STATUS_LABELS[o.status] || o.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      {o.phone && <span className="flex items-center gap-1 text-green-700 font-medium"><Phone size={11}/>{o.phone}</span>}
                      <span>{o.main_product}</span>
                      {o.shipping_address && <span className="flex items-center gap-1"><MapPin size={11}/>{o.shipping_address.substring(0,30)}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="font-black text-sm font-num" style={{ color:"#FF6200" }}>
                      {o.total.toLocaleString("ar-SA")} ر.س
                    </span>
                    {o.phone && (
                      <a href={`https://wa.me/${o.phone.replace('+','')}`} target="_blank"
                         onClick={e => e.stopPropagation()}
                         className="flex items-center gap-1 px-2 py-1 bg-green-500 text-white rounded-lg text-xs font-bold">
                        <MessageCircle size={11}/> واتساب
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div>
            {selected ? (
              <Card className="border-border shadow-sm sticky top-4">
                <CardContent className="p-5">
                  <h3 className="font-black text-base mb-3">{selected.customer_name}</h3>
                  <div className="text-center mb-4 p-3 rounded-xl" style={{ background:"#FF620015" }}>
                    <p className="text-3xl font-black" style={{ color:"#FF6200" }}>
                      {selected.total.toLocaleString("ar-SA")}
                    </p>
                    <p className="text-xs text-muted-foreground">ريال سعودي</p>
                  </div>
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
                  <div className="space-y-2 text-sm">
                    {[
                      { label:"رقم الطلب",    val:`#${selected.order_number}` },
                      { label:"المنتج",        val:selected.main_product },
                      { label:"الحالة",        val:STATUS_LABELS[selected.status]||selected.status },
                      { label:"العنوان",       val:selected.shipping_address },
                      { label:"طريقة الدفع",  val:selected.payment_method },
                      { label:"تاريخ الطلب",  val:selected.created_at ? new Date(selected.created_at).toLocaleDateString("ar-SA") : null },
                    ].filter(r => r.val).map(r => (
                      <div key={r.label} className="flex justify-between py-1.5 border-b border-border/40 last:border-0">
                        <span className="text-muted-foreground text-xs">{r.label}</span>
                        <span className="font-semibold text-xs text-left">{r.val}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="flex items-center justify-center h-48 text-muted-foreground border border-dashed rounded-xl">
                <p className="text-sm">انقر على طلب لرؤية تفاصيله</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
