// navbar
import {
  GraduationCap,
  Users,
  CreditCard,
  BarChart3,
  Settings,
  Home,
  UserCheck,
  DollarSign,
  FileText,
} from "lucide-react";
export const menuItems = [
  {
    id: "/",
    label: "Overview",
    icon: Home,
    description: "Dashboard overview and key metrics",
  },
  {
    id: "students",
    label: "Students",
    icon: GraduationCap,
    description: "Manage student records and profiles",
  },
  {
    id: "batches",
    label: "Batches",
    icon: Users,
    description: "Manage course batches and schedules",
  },
  {
    id: "admissions",
    label: "Admissions",
    icon: UserCheck,
    description: "Handle student admissions process",
  },
  {
    id: "payments",
    label: "Payments",
    icon: CreditCard,
    description: "Track payments and financial records",
  },
  {
    id: "financial",
    label: "Financial",
    icon: DollarSign,
    description: "Bank statements, cash book, ledgers",
  },
  {
    id: "reports",
    label: "Reports",
    icon: BarChart3,
    description: "Generate reports and analytics",
  },
  {
    id: "users",
    label: "Users",
    icon: Users,
    description: "Manage system users and permissions",
  },
  {
    id: "communication",
    label: "Communication",
    icon: FileText,
    description: "Email templates and communication logs",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    description: "System settings and configuration",
  },
];
