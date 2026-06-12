import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSheets } from "@/contexts/SheetsContext";
import {
  Truck,
  MapPin,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function DeliveryPage() {
  const { data, loading, refetch } = useSheets();
  const deliveries = data.deliveries;
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary">التوصيل</h1>
            <p className="text-muted-foreground mt-1">متابعة حالة الشحنات واللوجستيات.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg border border-green-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm font-bold">معدل النجاح: 95%</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-primary">آخر عمليات التوصيل</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {deliveries.map((delivery) => (
                  <div key={delivery.delivery_id} className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:border-primary/20 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        delivery.status === 'delivered' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                      )}>
                        {delivery.status === 'delivered' ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{delivery.product_type}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <MapPin className="w-3 h-3" />
                          <span>الرياض، {delivery.phone}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-foreground">
                        {delivery.status === 'delivered' ? 'تم التوصيل' : 'فشل التوصيل'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {delivery.delivered_at ? new Date(delivery.delivered_at).toLocaleTimeString('ar-SA') : '---'}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card className="border-none shadow-sm h-fit">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-primary">إحصائيات القنوات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { channel: 'واتساب', count: 45, color: 'bg-green-500' },
                { channel: 'رسائل نصية', count: 30, color: 'bg-blue-500' },
                { channel: 'بريد إلكتروني', count: 15, color: 'bg-primary' },
              ].map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold">{item.channel}</span>
                    <span className="text-muted-foreground">{item.count}%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full", item.color)} style={{ width: `${item.count}%` }}></div>
                  </div>
                </div>
              ))}

              <div className="pt-6 border-t mt-6">
                <Button className="w-full font-bold group" variant="outline">
                  عرض التقرير المفصل
                  <ArrowRight className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

