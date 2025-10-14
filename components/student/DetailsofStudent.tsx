"use client";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CreditCard,
  Edit,
  FileText,
  History,
  Mail,
  MapPin,
  Phone,
  Plus,
  User,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useRouter } from "next/navigation";
import { fetchStudentById } from "@/redux/features/student/studentSlice";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Separator } from "../ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
// import { Textarea } from "../ui/textarea";
// import { Label } from "../ui/label";
// import { Input } from "../ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "../ui/select";
interface DetailsofStudentProps {
  StudentId: string;
}

const DetailsofStudent: React.FC<DetailsofStudentProps> = ({ StudentId }) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [showAddPaymentDialog, setShowAddPaymentDialog] = useState(false);
  const [showFeeConfigDialog, setShowFeeConfigDialog] = useState(false);
  const {
    currentStudent: student,
    loading,
    error,
  } = useAppSelector((state) => state.students);

  // ✅ Fetch specific student when ID changes
  useEffect(() => {
    if (StudentId) {
      dispatch(fetchStudentById(StudentId));
    }
  }, [dispatch, StudentId]);

  const onBack = () => router.back();

  if (loading) {
    return (
      <p className="text-center text-muted-foreground">Loading student...</p>
    );
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  if (!student) {
    return (
      <p className="text-center text-muted-foreground">Student not found</p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-semibold">{student.name}</h2>
              {/* Example of badge if needed */}
              {/* {student.batchSwitched && (
                <Badge
                  variant="outline"
                  className="text-amber-600 border-amber-300 bg-amber-50"
                >
                  Batch Switched
                </Badge>
              )} */}
            </div>
            <p className="text-muted-foreground">
              {student.admissionNo} •{" "}
              {student.currentBatch?.name || "No batch info"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </div>
      </div>
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fee</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {/* ₹{feeConfig.totalCourseFee.toLocaleString()} */}
            </div>
            <p className="text-xs text-muted-foreground">
              {/* {feeConfig.discount > 0 &&
                `₹${feeConfig.discount.toLocaleString()} discount`} */}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Amount</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {/* ₹{feeConfig.paidAmount.toLocaleString()} */}
            </div>
            <p className="text-xs text-muted-foreground">
              {/* {mockPayments.length}  */}
              transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance Due</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {/* ₹{feeConfig.balanceAmount.toLocaleString()} */}
            </div>
            <p className="text-xs text-muted-foreground">
              {/* {feeConfig.feeDueMode || "Not configured"} */}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Account Type</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge
                variant={student.isFundedAccount ? "default" : "secondary"}
              >
                {student.isFundedAccount ? "Funded" : "Regular"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {/* {student.currentBatch.status} */}
            </p>
          </CardContent>
        </Card>
      </div>
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="fees">Fee Configuration</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="history">
            <div className="flex items-center gap-2">
              History
              {/* {hasBatchHistory && (
                <Badge variant="secondary" className="text-xs px-1 py-0">
                  {student.batchHistory.length}
                </Badge>
              )} */}
            </div>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{student.name}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{student.email || "N/A"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{student.phone}</span>
                </div>
                {student.address && (
                  <div className="flex items-start gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span>{student.address}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Current Batch */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Current Batch
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium">{student.currentBatch?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {student?.currentBatch?.course?.name}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge>{student?.currentBatch?.course?.mode}</Badge>
                  <Badge variant="outline">
                    {student?.currentBatch?.status}
                  </Badge>
                </div>
                <Separator />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tutor:</span>
                    <span>{student.currentBatch?.tutor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Coordinator:</span>
                    <span>{student.currentBatch?.coordinator}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location:</span>
                    <span>{student.currentBatch?.location?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Base Fee:</span>
                    <span className="font-medium">
                      ₹{student.currentBatch?.course?.baseFee.toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Admission Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Admission Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Admission No:</span>
                  <span className="font-medium">{student.admissionNo}</span>
                </div>
                {student.salesperson && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Salesperson:</span>
                    <span>{student.salesperson}</span>
                  </div>
                )}
                {student.referralInfo && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Referral:</span>
                    <span>{student.referralInfo}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Account Type:</span>
                  <Badge
                    variant={student.isFundedAccount ? "default" : "secondary"}
                  >
                    {student.isFundedAccount ? "Funded" : "Regular"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Fee Configuration Tab */}
        <TabsContent value="fees" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Fee Structure Configuration</CardTitle>
                <CardDescription>
                  Configure course fees, discounts, and payment terms
                </CardDescription>
              </div>
              <Dialog
                open={showFeeConfigDialog}
                onOpenChange={setShowFeeConfigDialog}
              >
                <DialogTrigger asChild>
                  <Button>
                    <Edit className="h-4 w-4 mr-2" />
                    Configure Fees
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Configure Fee Structure</DialogTitle>
                    <DialogDescription>
                      Set up the fee structure and payment terms for{" "}
                      {student.name}
                    </DialogDescription>
                  </DialogHeader>
                  {/* <FeeConfigurationForm
                    student={student}
                    initialConfig={feeConfig}
                    onSave={(config) => {
                      setFeeConfig(config);
                      setShowFeeConfigDialog(false);
                        toast.success("Fee configuration saved successfully!");
                    }}
                    onClose={() => setShowFeeConfigDialog(false)}
                  /> */}
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Total Course Fee
                  </p>
                  <p className="text-lg font-semibold">
                    {/* ₹{feeConfig.totalCourseFee.toLocaleString()} */}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Discount</p>
                  <p className="text-lg font-semibold">
                    {/* ₹{feeConfig.discount.toLocaleString()} */}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Final Fee</p>
                  <p className="text-lg font-semibold text-blue-600">
                    {/* ₹{feeConfig.finalFee.toLocaleString()} */}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Balance Amount
                  </p>
                  <p className="text-lg font-semibold text-red-600">
                    {/* ₹{feeConfig.balanceAmount.toLocaleString()} */}
                  </p>
                </div>
              </div>

              {/* {feeConfig.feeDueMode && (
                <div className="p-4 border rounded-lg bg-muted/50">
                  <h4 className="font-medium mb-2">Payment Terms</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Payment Mode:
                      </span>
                      <Badge variant="outline">
                        {feeConfig.feeDueMode === "FULL"
                          ? "Full Payment"
                          : feeConfig.feeDueMode === "WEEKLY"
                          ? "Weekly"
                          : "70-30 Split"}
                      </Badge>
                    </div>
                    {feeConfig.dueDate && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Due Date:</span>
                        <span>
                          {new Date(feeConfig.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )} */}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>
                  All payment transactions for this student
                </CardDescription>
              </div>
              <Dialog
                open={showAddPaymentDialog}
                onOpenChange={setShowAddPaymentDialog}
              >
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Payment
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-xl">
                  <DialogHeader>
                    <DialogTitle>Record Payment</DialogTitle>
                    <DialogDescription>
                      Add a new payment transaction for {student.name}
                    </DialogDescription>
                  </DialogHeader>
                  {/* <AddPaymentForm
                    student={student}
                    balanceAmount={feeConfig.balanceAmount}
                    onClose={() => setShowAddPaymentDialog(false)}
                    onSave={(payment) => {
                      // Update paid amount and balance
                      setFeeConfig((prev) => ({
                        ...prev,
                        paidAmount: prev.paidAmount + payment.amount,
                        balanceAmount: prev.balanceAmount - payment.amount,
                      }));
                      setShowAddPaymentDialog(false);
                      toast.success("Payment recorded successfully!");
                    }}
                  /> */}
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* {mockPayments.slice(0, 5).map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{payment.date.toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">
                        ₹{payment.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{payment.mode}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {payment.transactionId || "N/A"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {payment.notes || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                  {mockPayments.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-muted-foreground py-8"
                      >
                        No payments recorded yet
                      </TableCell>
                    </TableRow>
                  )} */}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          {/* Batch Switch History */}
          {/* {hasBatchHistory && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Repeat className="h-4 w-4" />
                  Batch Switch History
                </CardTitle>
                <CardDescription>
                  Complete history of batch changes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {student.batchHistory.map((history) => {
                  const oldFee = history.fromBatch.course.baseFee;
                  const newFee = history.toBatch.course.baseFee;
                  const feeDiff = newFee - oldFee;

                  return (
                    <div
                      key={history.id}
                      className="border rounded-lg p-4 space-y-3 bg-amber-50/50 dark:bg-amber-950/20 border-amber-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="text-amber-600 border-amber-300"
                            >
                              Batch Switched
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {history.changeDate.toLocaleDateString()}
                            </span>
                          </div>
                          <div className="text-sm space-y-1 mt-2">
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">
                                From:
                              </span>
                              <span className="font-medium">
                                {history.fromBatch.name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                ({history.fromBatch.course.name})
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">To:</span>
                              <span className="font-medium">
                                {history.toBatch.name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                ({history.toBatch.course.name})
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="border-t pt-2 space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Previous Fee:
                          </span>
                          <span>₹{oldFee.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            New Fee:
                          </span>
                          <span>₹{newFee.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm font-medium border-t pt-1">
                          <span className="text-muted-foreground">
                            Fee Adjustment:
                          </span>
                          <span
                            className={
                              feeDiff > 0
                                ? "text-red-600"
                                : feeDiff < 0
                                ? "text-green-600"
                                : ""
                            }
                          >
                            {feeDiff > 0 ? "+" : ""}₹{feeDiff.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {history.reason && (
                        <div className="border-t pt-2">
                          <p className="text-xs text-muted-foreground">
                            Reason:
                          </p>
                          <p className="text-sm mt-1">{history.reason}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )} */}

          {/* Activity Log */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Activity Log
              </CardTitle>
              <CardDescription>Recent activities and updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="border rounded-lg p-3">
                <p className="text-sm">
                  Currently enrolled in {student.currentBatch?.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {/* {student.currentBatch?.createdAt.toLocaleDateString()} */}
                </p>
              </div>
              <div className="border rounded-lg p-3">
                <p className="text-sm">Account created</p>
                <p className="text-xs text-muted-foreground">
                  Initial admission completed
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DetailsofStudent;

// Fee Configuration Form Component
// function FeeConfigurationForm({
//   student,
//   initialConfig,
//   onSave,
//   onClose,
// }: {
//   student: Student;
//   initialConfig: any;
//   onSave: (config: any) => void;
//   onClose: () => void;
// }) {
//   const [config, setConfig] = useState(initialConfig);

//   const handleInputChange = (field: string, value: any) => {
//     setConfig((prev: any) => {
//       const updated = { ...prev, [field]: value };

//       // Recalculate final fee and balance
//       const finalFee = updated.totalCourseFee - updated.discount;
//       updated.finalFee = finalFee;
//       updated.balanceAmount = finalFee - updated.paidAmount;

//       return updated;
//     });
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     onSave(config);
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4">
//       <div className="grid grid-cols-2 gap-4">
//         <div className="space-y-2">
//           <Label>Total Course Fee</Label>
//           <Input
//             type="number"
//             value={config.totalCourseFee}
//             onChange={(e) =>
//               handleInputChange("totalCourseFee", Number(e.target.value))
//             }
//           />
//         </div>
//         <div className="space-y-2">
//           <Label>Discount Amount</Label>
//           <Input
//             type="number"
//             value={config.discount}
//             onChange={(e) =>
//               handleInputChange("discount", Number(e.target.value))
//             }
//           />
//         </div>
//       </div>

//       <div className="p-4 border rounded-lg bg-muted/50">
//         <div className="flex justify-between text-sm">
//           <span className="text-muted-foreground">Final Fee:</span>
//           <span className="font-semibold">
//             ₹{config.finalFee.toLocaleString()}
//           </span>
//         </div>
//       </div>

//       <div className="space-y-2">
//         <Label>Fee Payment Mode</Label>
//         <Select
//           value={config.feeDueMode}
//           onValueChange={(value) => handleInputChange("feeDueMode", value)}
//         >
//           <SelectTrigger>
//             <SelectValue placeholder="Select payment mode" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="FULL">Full Payment (Pay in full)</SelectItem>
//             <SelectItem value="WEEKLY">Weekly Installments</SelectItem>
//             <SelectItem value="SEVENTY_THIRTY">70-30 Split</SelectItem>
//           </SelectContent>
//         </Select>
//       </div>

//       {config.feeDueMode && config.feeDueMode !== "FULL" && (
//         <div className="space-y-2">
//           <Label>Due Date</Label>
//           <Input
//             type="date"
//             value={config.dueDate}
//             onChange={(e) => handleInputChange("dueDate", e.target.value)}
//           />
//         </div>
//       )}

//       <div className="flex gap-3 justify-end pt-4">
//         <Button type="button" variant="outline" onClick={onClose}>
//           Cancel
//         </Button>
//         <Button type="submit">Save Configuration</Button>
//       </div>
//     </form>
//   );
// }

// Add Payment Form Component
// function AddPaymentForm({
//   student,
//   balanceAmount,
//   onClose,
//   onSave,
// }: {
//   student: Student;
//   balanceAmount: number;
//   onClose: () => void;
//   onSave: (payment) => void;
// }) {
//   const [paymentData, setPaymentData] = useState({
//     amount: 0,
//     mode: "" as PaymentMode | "",
//     transactionId: "",
//     date: new Date().toISOString().split("T")[0],
//     notes: "",
//   });

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!paymentData.amount || !paymentData.mode) {
//       toast.error("Please fill all required fields");
//       return;
//     }

//     if (paymentData.amount > balanceAmount) {
//       toast.error("Payment amount cannot exceed balance amount");
//       return;
//     }

//     const payment = {
//       id: Date.now(),
//       admissionId: 1,
//       amount: paymentData.amount,
//       mode: paymentData.mode as PaymentMode,
//       transactionId: paymentData.transactionId,
//       date: new Date(paymentData.date),
//       notes: paymentData.notes,
//     };

//     onSave(payment);
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4">
//       <div className="p-4 border rounded-lg bg-muted/50">
//         <div className="flex justify-between">
//           <span className="text-sm text-muted-foreground">Balance Amount:</span>
//           <span className="font-semibold text-lg">
//             ₹{balanceAmount.toLocaleString()}
//           </span>
//         </div>
//       </div>

//       <div className="space-y-2">
//         <Label>Payment Amount *</Label>
//         <Input
//           type="number"
//           value={paymentData.amount || ""}
//           onChange={(e) =>
//             setPaymentData((prev) => ({
//               ...prev,
//               amount: Number(e.target.value),
//             }))
//           }
//           placeholder="Enter amount"
//           max={balanceAmount}
//           required
//         />
//       </div>

//       <div className="space-y-2">
//         <Label>Payment Mode *</Label>
//         <Select
//           value={paymentData.mode}
//           onValueChange={(value) =>
//             setPaymentData((prev) => ({ ...prev, mode: value as PaymentMode }))
//           }
//         >
//           <SelectTrigger>
//             <SelectValue placeholder="Select payment mode" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="BANK">Bank Transfer</SelectItem>
//             <SelectItem value="RAZORPAY">Razorpay/UPI</SelectItem>
//             <SelectItem value="CASH">Cash</SelectItem>
//             <SelectItem value="DIRECTOR">Director</SelectItem>
//           </SelectContent>
//         </Select>
//       </div>

//       <div className="space-y-2">
//         <Label>Transaction ID</Label>
//         <Input
//           value={paymentData.transactionId}
//           onChange={(e) =>
//             setPaymentData((prev) => ({
//               ...prev,
//               transactionId: e.target.value,
//             }))
//           }
//           placeholder="Enter transaction/reference ID"
//         />
//       </div>

//       <div className="space-y-2">
//         <Label>Payment Date</Label>
//         <Input
//           type="date"
//           value={paymentData.date}
//           onChange={(e) =>
//             setPaymentData((prev) => ({ ...prev, date: e.target.value }))
//           }
//         />
//       </div>

//       <div className="space-y-2">
//         <Label>Notes</Label>
//         <Textarea
//           value={paymentData.notes}
//           onChange={(e) =>
//             setPaymentData((prev) => ({ ...prev, notes: e.target.value }))
//           }
//           placeholder="Add any notes or comments..."
//           rows={2}
//         />
//       </div>

//       <div className="flex gap-3 justify-end pt-4">
//         <Button type="button" variant="outline" onClick={onClose}>
//           Cancel
//         </Button>
//         <Button type="submit">Record Payment</Button>
//       </div>
//     </form>
//   );
// }
