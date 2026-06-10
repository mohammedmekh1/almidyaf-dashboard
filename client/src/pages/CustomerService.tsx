import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSheets } from "@/contexts/SheetsContext";
import {
  MessageSquare,
  User,
  Clock,
  AlertCircle,
  MoreHorizontal,
  Send
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function CustomerServicePage() {
  const { data, loading, refetch } = useSheets();
  const customerService = data.customerService;
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary">خدمة العملاء</h1>
            <p className="text-muted-foreground mt-1">إدارة المحادثات والدعم الفني.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2 rtl:space-x-reverse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-bold">
                  {i}
                </div>
              ))}
            </div>
            <span className="text-sm font-bold text-muted-foreground">فريق الدعم متاح</span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="lg:col-span-1 border-none shadow-sm h-[600px] flex flex-col">
            <CardHeader className="border-b">
              <CardTitle className="text-lg font-bold">المحادثات</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-y-auto">
              {customerService.map((chat) => (
                <div key={chat.cs_id} className="p-4 border-b hover:bg-muted/30 cursor-pointer transition-colors relative">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary border border-primary/10">
                      <User className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-sm truncate">{chat.name}</p>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(chat.received_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{chat.message}</p>
                    </div>
                  </div>
                  {chat.needs_human && (
                    <div className="absolute top-4 left-4 w-2 h-2 bg-red-500 rounded-full"></div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="lg:col-span-3 border-none shadow-sm h-[600px] flex flex-col relative overflow-hidden">
            <div className="absolute inset-0 bg-[#FAF7F2]/50 pointer-events-none opacity-50"
                 style={{ backgroundImage: 'radial-gradient(#8B1E1E 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}></div>

            <CardHeader className="border-b bg-white/80 backdrop-blur-md z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold">فاطمة علي</CardTitle>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">متصل الآن</span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon"><MoreHorizontal className="w-5 h-5" /></Button>
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-6 space-y-4 z-10">
              <div className="flex justify-start">
                <div className="bg-white p-4 rounded-2xl rounded-tr-none shadow-sm max-w-[80%] border">
                  <p className="text-sm">الطلب وصل تالف، أريد استبدال</p>
                  <span className="text-[10px] text-muted-foreground mt-2 block">15:20</span>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-primary text-primary-foreground p-4 rounded-2xl rounded-tl-none shadow-sm max-w-[80%]">
                  <p className="text-sm font-medium">مرحباً بكِ فاطمة، نأسف جداً لما حدث. هل يمكنكِ تزويدنا بصورة للمنتج؟</p>
                  <span className="text-[10px] text-primary-foreground/70 mt-2 block text-left">15:22</span>
                </div>
              </div>
            </CardContent>

            <div className="p-4 border-t bg-white/80 backdrop-blur-md z-10">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="اكتب رسالتك هنا..."
                  className="flex-1 bg-muted/50 border-none rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/20"
                />
                <Button size="icon" className="shadow-lg shadow-primary/20">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

