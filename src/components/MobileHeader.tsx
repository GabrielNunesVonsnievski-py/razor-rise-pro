import { Menu, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface MobileHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const MobileHeader = ({ title, subtitle, actions }: MobileHeaderProps) => {
  return (
    <header className="mobile-header flex items-center justify-between border-b border-border/50 bg-background/95 backdrop-blur sticky top-0 z-40 md:hidden">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="mobile-sidebar-trigger">
          <Menu className="w-5 h-5" />
        </SidebarTrigger>
        <div>
          <h1 className="text-lg font-bold text-primary">{title}</h1>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {actions}
        <Button variant="ghost" size="sm" className="p-2">
          <Bell className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
};