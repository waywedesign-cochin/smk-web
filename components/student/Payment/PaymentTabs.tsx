"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Plus, Pencil } from "lucide-react";
import type { Fee, Student, Payment } from "@/lib/types"; // adjust to your type location
import PaymentForm, { PaymentInput } from "./PaymentForm";

interface PaymentsTabProps {
  student: Student;
  latestFee: Fee;
  onAddPayment: (data: PaymentInput) => void;
  onEditPayment?: (payment: Payment) => void;
}

export default function PaymentsTab({
  student,
  latestFee,
  onAddPayment,
  onEditPayment,
}: PaymentsTabProps) {
  const [showAddPaymentDialog, setShowAddPaymentDialog] = useState(false);

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <CardTitle>Payments</CardTitle>
        <Button size="sm" onClick={() => setShowAddPaymentDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Payment
        </Button>
      </CardHeader>

      {/* Add Payment Dialog */}
      <Dialog
        open={showAddPaymentDialog}
        onOpenChange={setShowAddPaymentDialog}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Payment</DialogTitle>
            <DialogDescription>
              Record a payment for {student.name}
            </DialogDescription>
          </DialogHeader>

          <PaymentForm
            student={student}
            fee={latestFee}
            onSave={onAddPayment}
            onClose={() => setShowAddPaymentDialog(false)}
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
              <TableCell>Status</TableCell>
              <TableCell className="text-right">Actions</TableCell>
            </TableRow>
          </TableHeader>

          <TableBody>
            {latestFee?.payments?.length ? (
              latestFee.payments.map((p) => (
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
                      onClick={() => onEditPayment?.(p)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
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
