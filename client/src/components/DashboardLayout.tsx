import { Sidebar } from "./Sidebar";
import {
  Bell,
  Search,
  UserCircle,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar className="hidden md:flex" />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b bg-white/50 backdrop-blur-md sticky top-0 z-40 px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="p-0 w-64 border-l">
                <Sidebar className="w-full h-full border-none sticky-none" />
              </SheetContent>
            </Sheet>

            <div className={`relative max-w-md w-full transition-all duration-300 ${isSearchFocused ? 'max-w-lg' : ''}`}>
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="بحث..."
                className="pr-10 bg-muted/50 border-none focus-visible:ring-primary/20"
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-primary">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 left-2 w-2 h-2 bg-primary rounded-full border-2 border-background"></span>
            </Button>
            <div className="h-8 w-[1px] bg-border mx-1"></div>
            <div className="flex items-center gap-3 pl-2">
              <div className="hidden md:block text-left">
                <p className="text-sm font-bold text-foreground">مدير النظام</p>
                <p className="text-xs text-muted-foreground">مشرف العام</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <UserCircle className="w-6 h-6" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
