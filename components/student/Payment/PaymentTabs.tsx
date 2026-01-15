"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Plus, Edit, Loader2, DollarSign, Trash } from "lucide-react";
import type { Fee, Student, Payment } from "@/lib/types";
import PaymentForm, { PaymentInput } from "./PaymentForm";
import {
  createPayment,
  createPaymentDue,
  deletePayment,
  fetchPaymentsByStudent,
  updatePayment,
  updatePaymentDue,
} from "@/redux/features/payment/paymentSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import CreateDueForm, { DueInput } from "./CreateDueForm";
import { fetchFeeByStudentId } from "@/redux/features/fee/feeSlice";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface PaymentsTabProps {
  student: Student;
  latestFee: Fee;
}

export default function PaymentsTab({ student, latestFee }: PaymentsTabProps) {
  const dispatch = useAppDispatch();
  const { payments, loading, submitting } = useAppSelector(
    (state) => state.payments
  );
  const { currentUser } = useAppSelector((state) => state.users);
  const [showAddPaymentDialog, setShowAddPaymentDialog] = useState(false);
  const [openDueDialog, setOpenDueDialog] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);
  // Fetch payments
  const fetchPayments = async () => {
    if (student.id) {
      dispatch(fetchPaymentsByStudent(student.id));
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [student.id]);

  //fetch student data
  const getStudentDetails = async () => {
    if (student.id) {
      await dispatch(fetchFeeByStudentId(student.id));
    }
  };

  // Add payment
  const handleAddPayment = async (payment: PaymentInput) => {
    try {
      await dispatch(createPayment(payment)).unwrap();
      getStudentDetails();
      setShowAddPaymentDialog(false);
    } catch (err) {
      console.error("Failed to add payment:", err);
    }
  };

  // Edit payment
  const handleEditPayment = async (payment: PaymentInput) => {
    try {
      await dispatch(updatePayment(payment)).unwrap();
      getStudentDetails();
      setShowAddPaymentDialog(false);
    } catch (err) {
      console.error("Failed to update payment:", err);
    }
  };

  //delete payment
  const handelDeletePayment = async (paymentId: string) => {
    try {
      await dispatch(deletePayment(paymentId)).unwrap();

      setShowAddPaymentDialog(false);
    } catch (err) {
      console.error("Failed to update payment:", err);
    }
  };

  // Create payment due
  const handleCreateDue = async (payment: DueInput) => {
    try {
      await dispatch(createPaymentDue(payment)).unwrap();
      setOpenDueDialog(false);
    } catch (err) {
      console.error("Failed to add due payment:", err);
    }
  };

  //update payment due
  const handleUpdatePaymentDue = async (payment: DueInput) => {
    try {
      await dispatch(updatePaymentDue(payment)).unwrap();
      setOpenDueDialog(false);
    } catch (err) {
      console.error("Failed to add due payment:", err);
    }
  };

  return (
    <Card className="bg-gray-300/10 text-white backdrop-blur-3xl border-0">
      <CardHeader className="flex justify-between items-center">
        <CardTitle>Payments</CardTitle>
        {(currentUser?.role === 1 || currentUser?.role === 3) && (
          <div className="flex gap-2">
            <>
              {payments.length > 0 && (
                <Button
                  size="sm"
                  className="bg-blue/80 text-white border border-gray-600 hover:bg-white hover:text-black hover:border-black"
                  onClick={() => {
                    setOpenDueDialog(true), setSelectedPayment(null);
                  }}
                  disabled={latestFee.status==="PAID"}
                >
                  <Plus className="h-4 w-4" />
                  Create Payment Due
                </Button>
              )}
              <CreateDueForm
                open={openDueDialog}
                defaultFeeId={latestFee.id}
                initialData={
                  selectedPayment
                    ? {
                        id: selectedPayment.id,
                        feeId: selectedPayment.feeId,
                        amount: selectedPayment.amount,
                        dueDate: selectedPayment.dueDate
                          ? new Date(selectedPayment.dueDate)
                          : null,
                        note: selectedPayment.note,
                      }
                    : undefined
                }
                onSave={
                  selectedPayment ? handleUpdatePaymentDue : handleCreateDue
                }
                onClose={() => {
                  setOpenDueDialog(false);
                  setSelectedPayment(null);
                }}
              />
            </>
            <Button
              size="sm"
              onClick={() => setShowAddPaymentDialog(true)}
              className="bg-blue/80 text-white border border-gray-600 hover:bg-white hover:text-black hover:border-black"
            >
              <Plus className="h-4 w-4" />
              Add Payment
            </Button>
          </div>
        )}
      </CardHeader>

      {/* Add Payment Dialog */}
      <Dialog
        open={showAddPaymentDialog}
        onOpenChange={(open) => {
          if (!open) setSelectedPayment(null);
          setShowAddPaymentDialog(open);
        }}
      >
        <DialogContent className="max-w-2xl bg-[#0E1628] text-gray-200 border border-white/10 shadow-xl rounded-xl">
          <DialogHeader>
            <DialogTitle>
              {selectedPayment
                ? `Edit Payment for ${student.name}`
                : `Add Payment for ${student.name}`}
            </DialogTitle>
          </DialogHeader>

          <PaymentForm
            student={student}
            fee={latestFee}
            existingPayment={selectedPayment}
            onSave={handleAddPayment}
            onUpdate={handleEditPayment}
            onClose={() => {
              setShowAddPaymentDialog(false), setSelectedPayment(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Payments Table */}
      <CardContent>
        <div className="rounded-xl overflow-hidden border border-white/10 bg-black/30 shadow-lg">
          <Table className="min-w-full divide-y divide-gray-200/10">
            <TableHeader className="bg-gray-50/10 hover:bg-[#141617]">
              <TableRow className="bg-black border-none">
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                  Paid Date
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                  Due Date
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                  Amount
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                  Mode
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                  Transaction ID
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                  Notes
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                  Status
                </TableHead>
                {(currentUser?.role === 1 || currentUser?.role === 3) && (
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                    Actions
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-200/10 bg-black/10 border-0">
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-6 text-gray-500"
                  >
                    <div className="flex items-center justify-center gap-2 text-gray-500">
                      <Loader2 className="animate-spin h-5 w-5" />
                      Loading payments...
                    </div>
                  </TableCell>
                </TableRow>
              ) : payments?.length ? (
                payments.map((p, idx) => (
                  <TableRow
                    key={p.id}
                    className={`${
                      idx % 2 === 0
                        ? "bg-black/10 hover:bg-black/20"
                        : "bg-indigo-50/10 hover:bg-indigo-50/20"
                    } transition-colors rounded-lg border-0`}
                  >
                    {/* PAID DATE */}
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                      {p.paidAt
                        ? new Date(p.paidAt).toLocaleDateString("en-GB")
                        : "-"}
                    </TableCell>

                    {/* DUE DATE */}
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                      {p.dueDate
                        ? new Date(p.dueDate).toLocaleDateString("en-GB")
                        : "-"}
                    </TableCell>

                    {/* AMOUNT */}
                    <TableCell className="px-6 py-4 whitespace-nowrap text-gray-100 font-semibold">
                      ₹{p.amount.toLocaleString()}
                    </TableCell>

                    {/* MODE */}
                    <TableCell className="px-6 py-4 whitespace-nowrap text-gray-200">
                      {p.mode || "-"}
                    </TableCell>

                    {/* TRANSACTION ID */}
                    <TableCell className="px-6 py-4 whitespace-nowrap text-gray-300">
                      {p.transactionId || "-"}
                    </TableCell>

                    {/* NOTE */}
                    <TableCell className="px-6 py-4 whitespace-nowrap text-gray-300">
                      {p.note || "-"}
                    </TableCell>

                    {/* STATUS */}
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        className={
                          p.status === "PAID"
                            ? "bg-green-600 text-white"
                            : p.status === "PENDING"
                            ? "bg-yellow-500 text-black"
                            : "bg-red-600 text-white"
                        }
                      >
                        {p.status}
                      </Badge>
                    </TableCell>

                    {/* ACTIONS */}
                    {(currentUser?.role === 1 || currentUser?.role === 3) && (
                      <TableCell className="px-6 py-4">
                        <div className="flex gap-2">
                          {/* Edit Due */}
                          {p.status === "PENDING" && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => {
                                      setSelectedPayment(p);
                                      setOpenDueDialog(true);
                                    }}
                                    className="bg-white/10 border-white/20 text-gray-200 hover:bg-white/20"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Edit Due</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}

                          {/* Edit Payment */}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedPayment(p);
                                    setShowAddPaymentDialog(true);
                                  }}
                                  className="bg-blue-600 text-white hover:bg-blue-700 px-2 text-xs"
                                >
                                  Edit Pay
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                Record/Edit Payment
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          {/* Delete */}
                          {p.status === "PENDING" && (
                            <Button
                              onClick={() => {
                                setPaymentToDelete(p);
                                setOpenDeleteDialog(true);
                              }}
                              className="bg-red-600 text-white hover:bg-red-700 px-2"
                            >
                              <Trash />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-6 text-gray-500"
                  >
                    No payments found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* DELETE CONFIRMATION — unchanged */}
        <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This payment will permanently be
                deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={submitting}>
                Cancel
              </AlertDialogCancel>
              <Button
                onClick={async () => {
                  if (!paymentToDelete) return;
                  try {
                    await handelDeletePayment(paymentToDelete.id);
                    setOpenDeleteDialog(false);
                    setPaymentToDelete(null);
                  } catch (err) {
                    console.error(err);
                  }
                }}
                disabled={submitting}
              >
                {submitting ? "Deleting..." : "Continue"}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
