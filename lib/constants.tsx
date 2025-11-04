// navbar
import {
  GraduationCap,
  Users,
  // CreditCard,
  BarChart3,
  Settings,
  Home,
  BookMarked,
  Logs,
  AudioLines,
  DollarSign,
  Laptop,
  // UserCheck,
  // DollarSign,
  // FileText,
} from "lucide-react";
import { id } from "zod/v4/locales";
// import { Batch, BatchMode, BatchStatus, Course, Location } from "./types";
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
    icon: Laptop,
    description: "Manage course batches and schedules",
  },
  {
    id: "users",
    label: "Users",
    icon: Users,
    description: "Manage system users and permissions",
  },
  {
    id: "cashbook",
    label: "Cash Book",
    icon: BookMarked,
    description: "Daily cash transactions and balance tracking",
  },
  {
    id: "communication",
    label: "Communication",
    icon: AudioLines,
    description: "View communication history and logs",
  },
  {
    id: "director-ledger",
    label: "Director Ledger",
    icon: DollarSign,
    description: "Track director transactions and accounts",
  },
  // {
  //   id: "admissions",
  //   label: "Admissions",
  //   icon: UserCheck,
  //   description: "Handle student admissions process",
  // },
  // {
  //   id: "payments",
  //   label: "Payments",
  //   icon: CreditCard,
  //   description: "Track payments and financial records",
  // },
  // {
  //   id: "financial",
  //   label: "Financial",
  //   icon: DollarSign,
  //   description: "Bank statements, cash book, ledgers",
  // },
  {
    id: "reports",
    label: "Reports",
    icon: BarChart3,
    description: "Generate reports and analytics",
  },
  // {
  //   id: "communication",
  //   label: "Communication",
  //   icon: FileText,
  //   description: "Email templates and communication logs",
  // },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    description: "System settings and configuration",
  },
];

// export const mockLocations: Location[] = [
//   {
//     id: 1,
//     name: "Downtown Campus",
//     batches: [],
//     cashBooks: [],
//   },
//   {
//     id: 2,
//     name: "North Branch",
//     batches: [],
//     cashBooks: [],
//   },
//   {
//     id: 3,
//     name: "South Campus",
//     batches: [],
//     cashBooks: [],
//   },
// ];

// export const mockCourses: Course[] = [
//   {
//     id: 1,
//     name: "Full Stack Development",
//     description: "Learn web development from scratch",
//     baseFee: 10000,
//     batches: [],
//   },
//   {
//     id: 2,
//     name: "Data Science",
//     description: "Learn data analysis and machine learning",
//     baseFee: 12000,
//     batches: [],
//   },
// ];
// export const mockBatches: Batch[] = [
//   {
//     id: 1,
//     name: "FSD-2024-01",
//     year: 2024,
//     location: mockLocations[0],
//     locationId: 1,
//     course: mockCourses[0],
//     courseId: 1,
//     tutor: "John Smith",
//     coordinator: "Sarah Johnson",
//     slotLimit: 30,
//     currentCount: 25,
//     mode: "HYBRID" as BatchMode,
//     status: "ACTIVE" as BatchStatus,
//     students: [],
//     createdAt: new Date("2024-01-15"),
//     updatedAt: new Date("2024-12-01"),
//   },
// ];
