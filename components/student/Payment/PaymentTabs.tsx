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
import { Plus, Edit, Loader2 } from "lucide-react";
import type { Fee, Student, Payment } from "@/lib/types";
import PaymentForm, { PaymentInput } from "./PaymentForm";
import {
  createPayment,
  createPaymentDue,
  fetchPaymentsByStudent,
  updatePayment,
} from "@/redux/features/payment/paymentSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import CreateDueForm, { DueInput } from "./CreateDueForm";

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
      setShowAddPaymentDialog(false);
    } catch (err) {
      console.error("Failed to add payment:", err);
    }
  };

  // Edit payment
  const handleEditPayment = async (payment: PaymentInput) => {
    try {
      await dispatch(updatePayment(payment)).unwrap();
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

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <CardTitle>Payments</CardTitle>
        <div className="flex gap-2">
          {latestFee?.feePaymentMode === "others" && (
            <>
              <Button size="sm" onClick={() => setOpenDueDialog(true)}>
                <Plus className="h-4 w-4" />
                Create Payment Due
              </Button>

              <CreateDueForm
                open={openDueDialog}
                defaultFeeId={latestFee.id}
                onSave={handleCreateDue}
                onClose={() => setOpenDueDialog(false)}
              />
            </>
          )}
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
              <TableCell className="text-right">Actions</TableCell>
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
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setSelectedPayment(p);
                        setShowAddPaymentDialog(true);
                      }}
                      className="cursor-pointer"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
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
      </CardContent>
    </Card>
  );
}
