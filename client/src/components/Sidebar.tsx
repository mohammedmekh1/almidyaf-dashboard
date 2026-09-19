import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BarChart3, Boxes, Crown, FileText, LayoutDashboard, Menu, Package, Radar, Truck, Users, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";

const NAV = [
  { icon: LayoutDashboard, label: "مركز القيادة", caption: "Executive Overview", href: "/" },
  { icon: Radar, label: "الرادار والمبيعات", caption: "Leads & CRM", href: "/leads" },
  { icon: FileText, label: "استوديو المحتوى", caption: "Social Publishing", href: "/content" },
  { icon: Boxes, label: "الكتالوج واللوجستيات", caption: "Catalog & Orders", href: "/orders" },
  { icon: Users, label: "خدمة العملاء", caption: "Customer Experience", href: "/customer-service" },
  { icon: Truck, label: "التوصيل", caption: "Saudi Fulfillment", href: "/delivery" },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const [location] = useLocation();
  return <div className="flex flex-col h-full sidebar-luxury">
    <div className="brand-lockup"><div className="brand-mark"><Crown size={19} /></div><div><p className="brand-name">MONTNERO</p><p className="brand-subtitle">غرفة القيادة التنفيذية</p></div>{onClose && <button onClick={onClose} className="close-sidebar"><X size={18} /></button>}</div>
    <ScrollArea className="flex-1 px-3 py-5"><p className="nav-heading">المنظومة</p><nav className="space-y-1">{NAV.map((item) => { const active = location === item.href; return <Link key={item.href} href={item.href} onClick={onClose} className={cn("nav-item", active && "nav-item-active")}><item.icon size={18} /><span><b>{item.label}</b><small>{item.caption}</small></span>{active && <span className="nav-active-dot" />}</Link>; })}</nav><p className="nav-heading mt-8">مساحات العمل</p><div className="sidebar-mini-links"><a href="/tasks"><BarChart3 size={16} /> مؤشرات الأداء</a><a href="/delivery"><Package size={16} /> حركة الشحنات</a></div></ScrollArea>
    <div className="sidebar-footer"><div className="system-chip"><span /> المنظومة تعمل بكفاءة</div><p>MONTNERO · RIYADH 2026</p></div>
  </div>;
}

export function Sidebar({ className }: { className?: string }) { return <aside className={cn("w-[278px] hidden md:flex flex-col h-screen sticky top-0 shrink-0", className)}><SidebarContent /></aside>; }
export function MobileSidebar() { const [open, setOpen] = useState(false); return <><button className="md:hidden mobile-menu" onClick={() => setOpen(true)}><Menu size={20} /></button>{open && <><div className="fixed inset-0 z-40 bg-black/40" onClick={() => setOpen(false)} /><div className="fixed right-0 top-0 h-full w-[278px] z-50 shadow-2xl"><SidebarContent onClose={() => setOpen(false)} /></div></>}</>; }
