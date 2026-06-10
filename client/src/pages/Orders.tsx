import DashboardLayout from "@/components/DashboardLayout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSheets } from "@/contexts/SheetsContext";
import {
  Eye,
  Download
} from "lucide-react";

export default function OrdersPage() {
  const { data, loading, refetch } = useSheets();
  const orders = data.orders;
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary">الطلبات</h1>
            <p className="text-muted-foreground mt-1">تتبع وإدارة طلبات اللحوم والذبائح.</p>
          </div>
          <Button variant="outline" size="sm" className="font-bold">
            <Download className="w-4 h-4 ml-2" />
            تحميل سجل الطلبات
          </Button>
        </header>

        <Card className="border-none shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="text-right font-bold">رقم الطلب</TableHead>
                  <TableHead className="text-right font-bold">العميل</TableHead>
                  <TableHead className="text-right font-bold">المنتج الأساسي</TableHead>
                  <TableHead className="text-right font-bold">القيمة الإجمالية</TableHead>
                  <TableHead className="text-right font-bold">الحالة</TableHead>
                  <TableHead className="text-right font-bold">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.order_id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-bold text-primary">{order.order_number}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground">{order.customer_name}</span>
                        <span className="text-xs text-muted-foreground">{order.phone}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{order.main_product}</TableCell>
                    <TableCell className="font-bold text-primary">
                      {order.total} {order.currency}
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        order.status === "delivered" ? "bg-green-100 text-green-700" :
                        order.status === "processing" ? "bg-blue-100 text-blue-700" :
                        "bg-yellow-100 text-yellow-700"
                      }>
                        {order.status === "delivered" ? "تم التوصيل" :
                         order.status === "processing" ? "قيد المعالجة" : "انتظار"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/5">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

