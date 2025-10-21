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

  // Add payment
  const handleAddPayment = async (payment: PaymentInput) => {
    try {
      await dispatch(createPayment(payment)).unwrap();
      if (student.id) await dispatch(fetchFeeByStudentId(student.id));
      setShowAddPaymentDialog(false);
    } catch (err) {
      console.error("Failed to add payment:", err);
    }
  };

  // Edit payment
  const handleEditPayment = async (payment: PaymentInput) => {
    try {
      await dispatch(updatePayment(payment)).unwrap();
      if (student.id) await dispatch(fetchFeeByStudentId(student.id));

      setShowAddPaymentDialog(false);
    } catch (err) {
      console.error("Failed to update payment:", err);
    }
  };

  //delete payment
  const handelDeletePayment = async (paymentId: string) => {
    try {
      await dispatch(deletePayment(paymentId)).unwrap();
      if (student.id) await dispatch(fetchFeeByStudentId(student.id));

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
    <Card>
      <CardHeader className="flex justify-between items-center">
        <CardTitle>Payments</CardTitle>
        <div className="flex gap-2">
          <>
            <Button
              size="sm"
              onClick={() => {
                setOpenDueDialog(true), setSelectedPayment(null);
              }}
            >
              <Plus className="h-4 w-4" />
              Create Payment Due
            </Button>

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
          <Button size="sm" onClick={() => setShowAddPaymentDialog(true)}>
            <Plus className="h-4 w-4" />
            Add Payment
          </Button>
        </div>
      </CardHeader>

      {/* Add Payment Dialog */}
      <Dialog
        open={showAddPaymentDialog}
        onOpenChange={(open) => {
          if (!open) setSelectedPayment(null);
          setShowAddPaymentDialog(open);
        }}
      >
        <DialogContent className="max-w-2xl">
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell>Paid Date</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Mode</TableCell>
              <TableCell>Transaction ID</TableCell>
              <TableCell>Notes</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="p-10">
                  <div className="flex items-center justify-center w-full gap-2">
                    <Loader2 className="animate-spin h-6 w-6 text-gray-500" />
                    <span className="text-gray-500">Loading payments...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : payments?.length ? (
              payments.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    {p.paidAt
                      ? new Date(p.paidAt).toLocaleDateString("en-GB")
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {p.dueDate
                      ? new Date(p.dueDate).toLocaleDateString("en-GB")
                      : "-"}
                  </TableCell>
                  <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                    ₹{p.amount.toLocaleString()}
                  </TableCell>
                  <TableCell>{p.mode || "-"}</TableCell>
                  <TableCell>{p.transactionId || "-"}</TableCell>
                  <TableCell>{p.note || "-"}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        p.status === "PAID"
                          ? "bg-green-500 hover:bg-green-600"
                          : p.status === "PENDING"
                          ? "bg-yellow-500 hover:bg-yellow-600"
                          : "bg-red-500 hover:bg-red-600"
                      }
                    >
                      {p.status}
                    </Badge>
                  </TableCell>

                  {/* Action Button */}
                  <TableCell>
                    <div className="flex justify-start gap-2">
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
                                className=""
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit Due</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}

                      {/* Record Payment */}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="default"
                              size="icon"
                              onClick={() => {
                                setSelectedPayment(p);
                                setShowAddPaymentDialog(true);
                              }}
                              className=" bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 cursor-pointer"
                            >
                              <DollarSign className="h-4 w-4 text-white" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Record/Edit Payment</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      {p.status === "PENDING" && (
                        <Button
                          onClick={() => {
                            setPaymentToDelete(p);
                            setOpenDeleteDialog(true);
                          }}
                          className="bg-red-600 text-white hover:bg-red-700 cursor-pointer"
                        >
                          <Trash />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center text-muted-foreground"
                >
                  No payments found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
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
