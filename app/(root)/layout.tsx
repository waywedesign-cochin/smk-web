import DashboardSidebar from "@/components/shared/DashboardSidebar/DashboardSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider className="border-0 w-full mih-h-screen flex">
      <DashboardSidebar>{children}</DashboardSidebar>
    </SidebarProvider>
  );
}
