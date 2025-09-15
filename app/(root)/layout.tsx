import DashboardSidebar from "@/components/shared/DashboardSidebar/DashboardSidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return <DashboardSidebar>{children}</DashboardSidebar>;
}
