// Types based on Prisma schema
export interface User {
  id: string;
  email: string;
  username: string;
  password: string;
  role: number;
  name?: string;
  location?: Location;
  locationId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// export enum UserRole {
//   ADMIN = "ADMIN",
//   STAFF = "STAFF",
//   DIRECTOR = "DIRECTOR",
// }

export interface Location {
  id?: string;
  name: string;
  address?: string;
  batches?: Batch[];
  createdAt?: string;
}

export interface Course {
  id?: string;
  name: string;
  description?: string;
  baseFee: number;
  duration: number;
  batches?: Batch[];
  isActive: boolean;
  mode: "ONLINE" | "OFFLINE" | "COMBINED";
}

export interface Batch {
  id?: string;
  startDate: string;
  name: string;
  year: number;
  location?: Location;
  locationId: string;
  course?: Course;
  courseId: string;
  tutor?: string;
  coordinator?: string;
  slotLimit: number;
  currentCount: number;

  status: BatchStatus;
  students?: Student[];
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum BatchMode {
  ONLINE = "ONLINE",
  OFFLINE = "OFFLINE",
  COMBINED = "COMBINED",
}

export enum BatchStatus {
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  PENDING = "PENDING",
}
export interface BatchResponse {
  batches: Batch[];
  pagination: {
    currentPage: number;
    limit: number;
    totalPages: number;
    totalCount: number;
  };
}

export interface Student {
  id?: string;
  admissionNo: string;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  salesperson?: string;
  referralInfo?: string;
  isFundedAccount: boolean;
  currentBatch?: Batch;
  currentBatchId: string;
  fees?: Fee[];
  // payments: Payment[];
  //   admissions: Admission[];
  //   payments: Payment[];
  //   batchHistory: BatchHistory[];
  // communications: CommunicationLog[];
}
export interface Fee {
  id?: string;
  totalCourseFee: number;
  finalFee?: number;
  discountAmount?: number;
  advanceAmount?: number;
  balanceAmount: number;
  feePaymentMode?: string;
  student: Student;
  studentId: string;
  payments: Payment[];
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
  batchHistoryFrom?: BatchHistory[];
  batchHistoryTo?: BatchHistory[];
}

export interface Admission {
  id: number;
  student: Student;
  studentId: number;
  batch: Batch;
  batchId: number;
  admissionDate: Date;
  salesperson?: string;
  feeDueMode: FeeDueMode;
  dueDate?: Date;
  totalCourseFee: number;
  discount: number;
  advanceAmount: number;
  balanceAmount: number;
  paymentMode: PaymentMode;
  upiTransactionId?: string;
  referralInfo?: string;
  payments: Payment[];
}

export enum FeeDueMode {
  WEEKLY = "WEEKLY",
  SEVENTY_THIRTY = "SEVENTY_THIRTY",
}

export enum PaymentMode {
  BANK = "BANK",
  RAZORPAY = "RAZORPAY",
  DIRECTOR = "DIRECTOR",
  CASH = "CASH",
}

export interface Payment {
  id: string;
  amount: number;
  mode?: string;
  paidAt?: Date | null;
  dueDate?: Date | null;
  transactionId?: string;
  note?: string;
  status: "PENDING" | "COMPLETED" | "FAILED" | string; // optional enum expansion
  studentId: string;
  feeId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BankStatement {
  id: number;
  date: Date;
  particulars: string;
  debit: number;
  credit: number;
  transactionId?: string;
  student?: Student;
  payment?: Payment;
}

export interface CashBook {
  id: number;
  location: Location;
  locationId: number;
  date: Date;
  particulars: string;
  debit: number;
  credit: number;
  openingBalance: number;
  closingBalance: number;
  student?: Student;
  payment?: Payment;
}

export interface DirectorLedger {
  id: number;
  director: Director;
  directorId: number;
  date: Date;
  particulars: string;
  debit: number;
  credit: number;
  balance: number;
  student?: Student;
  payment?: Payment;
}

export interface Director {
  id: number;
  name: string;
  ledgers: DirectorLedger[];
}

export interface BatchHistory {
  id: number;
  transferId: string;
  student: Student;
  studentId: number;
  fromBatch: Batch;
  fromBatchId: number;
  toBatch: Batch;
  toBatchId: number;
  changeDate: Date;
  reason?: string;
}

export interface CommunicationLog {
  id: number;
  student: Student;
  studentId: number;
  type: CommunicationType;
  sentAt: Date;
  status: CommunicationStatus;
  notes?: string;
}

export enum CommunicationType {
  ADMISSION_CONFIRMATION = "ADMISSION_CONFIRMATION",
  PAYMENT_REMINDER = "PAYMENT_REMINDER",
}

export enum CommunicationStatus {
  SENT = "SENT",
  DELIVERED = "DELIVERED",
  FAILED = "FAILED",
}

// Application and Admission related types
export interface AdmissionApplication {
  id: number;
  applicationNo: string;
  applicantName: string;
  email: string;
  phone: string;
  address?: string;
  dateOfBirth?: Date;
  qualification?: string;
  courseId: number;
  course: Course;
  locationId: number;
  location: Location;
  status: ApplicationStatus;
  submissionDate: Date;
  reviewDate?: Date;
  reviewedBy?: string;
  reviewNotes?: string;
  documents: ApplicationDocument[];
  salesperson?: string;
  referralInfo?: string;
  emergencyContact?: EmergencyContact;
  createdAt: Date;
  updatedAt: Date;
}

export enum ApplicationStatus {
  APPLIED = "APPLIED",
  UNDER_REVIEW = "UNDER_REVIEW",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  ENROLLED = "ENROLLED",
  WAITLISTED = "WAITLISTED",
}

export interface ApplicationDocument {
  id: number;
  applicationId: number;
  documentType: DocumentType;
  fileName: string;
  fileUrl: string;
  uploadDate: Date;
  verified: boolean;
  verifiedBy?: string;
  verificationDate?: Date;
}

export enum DocumentType {
  PHOTO = "PHOTO",
  ID_PROOF = "ID_PROOF",
  ADDRESS_PROOF = "ADDRESS_PROOF",
  QUALIFICATION_CERTIFICATE = "QUALIFICATION_CERTIFICATE",
  EXPERIENCE_CERTIFICATE = "EXPERIENCE_CERTIFICATE",
  OTHER = "OTHER",
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  content: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Dashboard specific types
export interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  totalRevenue: number;
  pendingPayments: number;
  activeBatches: number;
  completedBatches: number;
  newAdmissions: number;
  recentPayments: Payment[];
}
