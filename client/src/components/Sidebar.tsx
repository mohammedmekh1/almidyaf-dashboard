import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LayoutDashboard, Users, ShoppingBag,
  Truck, CheckSquare, HeadphonesIcon, FileText,
  Menu, X,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";

const NAV = [
  { icon: LayoutDashboard, label: "نظرة عامة",       href: "/" },
  { icon: Users,           label: "العملاء",          href: "/leads" },
  { icon: ShoppingBag,     label: "الطلبات",          href: "/orders" },
  { icon: CheckSquare,     label: "مهام المبيعات",    href: "/tasks" },
  { icon: Truck,           label: "التوصيل",          href: "/delivery" },
  { icon: HeadphonesIcon,  label: "خدمة العملاء",     href: "/customer-service" },
  { icon: FileText,        label: "المحتوى",          href: "/content" },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const [location] = useLocation();

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--sidebar)" }}>
      {/* شعار */}
      <div className="p-5 border-b flex items-center justify-between"
           style={{ borderColor: "var(--sidebar-border)" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg font-bold"
               style={{ background: "var(--sidebar-primary)", color: "var(--sidebar-primary-foreground)" }}>
            🥩
          </div>
          <div>
            <p className="font-bold text-sm leading-tight"
               style={{ color: "var(--sidebar-foreground)" }}>لحوم المضياف</p>
            <p className="text-xs opacity-60"
               style={{ color: "var(--sidebar-foreground)" }}>لوحة الإدارة</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 rounded opacity-60 hover:opacity-100"
                  style={{ color: "var(--sidebar-foreground)" }}>
            <X size={18} />
          </button>
        )}
      </div>

      {/* روابط */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {NAV.map((item) => {
            const active = location === item.href;
            return (
              <Link key={item.href} href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150",
                      active
                        ? "shadow-sm"
                        : "opacity-70 hover:opacity-100"
                    )}
                    style={active
                      ? { background: "var(--sidebar-primary)", color: "var(--sidebar-primary-foreground)" }
                      : { color: "var(--sidebar-foreground)" }
                    }>
                <item.icon size={17} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* footer */}
      <div className="p-4 border-t text-center"
           style={{ borderColor: "var(--sidebar-border)" }}>
        <p className="text-xs opacity-40" style={{ color: "var(--sidebar-foreground)" }}>
          المضياف © 2025
        </p>
      </div>
    </div>
  );
}

export function Sidebar({ className }: { className?: string }) {
  return (
    <aside className={cn("w-60 hidden md:flex flex-col h-screen sticky top-0 shrink-0", className)}>
      <SidebarContent />
    </aside>
  );
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="md:hidden fixed top-4 right-4 z-50 p-2 rounded-lg shadow-lg"
        style={{ background: "var(--sidebar)", color: "var(--sidebar-foreground)" }}
        onClick={() => setOpen(true)}>
        <Menu size={20} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setOpen(false)} />
          <div className="fixed right-0 top-0 h-full w-60 z-50 shadow-2xl">
            <SidebarContent onClose={() => setOpen(false)} />
          </div>
        </>
      )}
    </>
  );
}
