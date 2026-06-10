import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSheets } from "@/contexts/SheetsContext";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  MoreVertical,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function TasksPage() {
  const { data, loading, refetch } = useSheets();
  const tasks = data.salesTasks;
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary">مهام المبيعات</h1>
            <p className="text-muted-foreground mt-1">متابعة الأنشطة والمهام اليومية لفريق المبيعات.</p>
          </div>
          <Button className="font-bold shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4 ml-2" />
            مهمة جديدة
          </Button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['open', 'escalated', 'closed'].map((status) => (
            <div key={status} className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  {status === 'open' && <Clock className="w-5 h-5 text-blue-500" />}
                  {status === 'escalated' && <AlertCircle className="w-5 h-5 text-red-500" />}
                  {status === 'closed' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                  {status === 'open' ? 'قيد التنفيذ' : status === 'escalated' ? 'متأخرة' : 'مكتملة'}
                </h3>
                <Badge variant="secondary" className="font-bold">
                  {tasks.filter(t => t.task_status === status).length}
                </Badge>
              </div>

              <div className="space-y-4">
                {tasks.filter(t => t.task_status === status).map((task) => (
                  <Card key={task.task_id} className="border-none shadow-sm hover:shadow-md transition-all cursor-pointer group">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <Badge variant="outline" className={cn(
                            "text-[10px] font-bold uppercase",
                            task.priority === 'high' ? "text-red-600 border-red-200" : "text-blue-600 border-blue-200"
                          )}>
                            {task.priority === 'high' ? 'أولوية قصوى' : 'أولوية متوسطة'}
                          </Badge>
                          <h4 className="font-bold text-foreground group-hover:text-primary transition-colors">{task.name}</h4>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="mt-4 space-y-2">
                        <p className="text-sm text-muted-foreground line-clamp-2">{task.action_required}</p>
                        <div className="flex items-center justify-between mt-4 pt-4 border-t">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                              {task.assigned_to[0]}
                            </div>
                            <span className="text-xs font-medium text-muted-foreground">{task.assigned_to}</span>
                          </div>
                          <span className="text-[10px] font-bold text-muted-foreground">{new Date(task.created_at).toLocaleDateString('ar-SA')}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

