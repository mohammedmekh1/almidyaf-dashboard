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
  MoreVertical,
  Filter,
  Download,
  Phone,
  MessageCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function LeadsPage() {
  const { data, loading, refetch } = useSheets();
  const leads = data.leads.filter(l => !l.is_demo);
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary">العملاء المحتملون</h1>
            <p className="text-muted-foreground mt-1">إدارة ومتابعة العملاء المهتمين بمنتجاتنا.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="font-bold">
              <Filter className="w-4 h-4 ml-2" />
              تصفية
            </Button>
            <Button variant="outline" size="sm" className="font-bold">
              <Download className="w-4 h-4 ml-2" />
              تصدير
            </Button>
          </div>
        </header>

        <Card className="border-none shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="text-right font-bold">العميل</TableHead>
                  <TableHead className="text-right font-bold">المنتج</TableHead>
                  <TableHead className="text-right font-bold">المصدر</TableHead>
                  <TableHead className="text-right font-bold">الفئة</TableHead>
                  <TableHead className="text-right font-bold">التاريخ</TableHead>
                  <TableHead className="text-right font-bold">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.lead_id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground">{lead.name}</span>
                        <span className="text-xs text-muted-foreground">{lead.phone}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{lead.detected_product}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10">
                        {lead.source}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn(
                        "font-bold",
                        lead.category === "hot" ? "bg-red-100 text-red-700 hover:bg-red-200" :
                        lead.category === "warm" ? "bg-orange-100 text-orange-700 hover:bg-orange-200" :
                        "bg-blue-100 text-blue-700 hover:bg-blue-200"
                      )}>
                        {lead.category === "hot" ? "ساخن" : lead.category === "warm" ? "دافئ" : "بارد"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(lead.created_at).toLocaleDateString('ar-SA')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:bg-green-50">
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50">
                          <Phone className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
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

