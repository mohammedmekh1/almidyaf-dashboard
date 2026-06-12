import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSheets } from "@/contexts/SheetsContext";
import {
  FileText,
  ExternalLink,
  CheckCircle,
  TrendingUp,
  Plus,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ContentPage() {
  const { data, loading, refetch } = useSheets();
  const content = data.content;
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary">إدارة المحتوى</h1>
            <p className="text-muted-foreground mt-1">إدارة المقالات وتحسين محركات البحث (SEO).</p>
          </div>
          <Button className="font-bold shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4 ml-2" />
            مقال جديد
          </Button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-none shadow-sm bg-primary text-primary-foreground">
            <CardContent className="p-6">
              <p className="text-sm font-bold opacity-80">إجمالي المقالات</p>
              <h3 className="text-3xl font-bold mt-1">{content.length}</h3>
              <div className="mt-4 flex items-center gap-1 text-xs">
                <CheckCircle className="w-3 h-3" />
                <span>{content.filter(c => c.status === 'published').length} منشورة</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-6">
              <p className="text-sm font-bold text-muted-foreground">متوسط درجة SEO</p>
              <h3 className="text-3xl font-bold mt-1 text-primary">87</h3>
              <div className="mt-4 flex items-center gap-1 text-xs text-green-600">
                <TrendingUp className="w-3 h-3" />
                <span>تحسن بنسبة 5%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white md:col-span-2">
            <CardContent className="p-6 flex items-center justify-between h-full">
              <div>
                <p className="text-sm font-bold text-muted-foreground">الأداء العام للمحتوى</p>
                <p className="text-xs text-muted-foreground mt-1">تحليل الظهور في محركات البحث</p>
              </div>
              <BarChart3 className="w-12 h-12 text-primary/20" />
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader className="bg-white border-b">
            <CardTitle className="text-lg font-bold">سجل المحتوى</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {content.map((article) => (
                <div key={article.article_id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center text-primary border border-primary/10">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{article.meta_title}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 font-medium">
                        <span className="bg-muted px-2 py-0.5 rounded">{article.keyword_main}</span>
                        <span>درجة SEO: <span className={cn(
                          "font-bold",
                          article.seo_score >= 90 ? "text-green-600" : "text-orange-600"
                        )}>{article.seo_score}</span></span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className={cn(
                      "font-bold",
                      article.status === 'published' ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    )}>
                      {article.status === 'published' ? 'منشور' : 'قيد المراجعة'}
                    </Badge>
                    <Button variant="ghost" size="icon" asChild>
                      <a href={article.salla_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-primary" />
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

