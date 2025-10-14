import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Edit } from "lucide-react";
import FeeConfigurationForm, { FeeSubmission } from "./FeeConfigurationForm";
import { Fee, Student } from "@/lib/types";

interface FeeConfigurationTabProps {
  student: Student;
  latestFee: Fee;
  showFeeConfigDialog: boolean;
  setShowFeeConfigDialog: (value: boolean) => void;
  handleConfigureFee: (data: FeeSubmission) => void; // instead of 'any'
}

export default function FeeConfigurationTab({
  student,
  latestFee,
  showFeeConfigDialog,
  setShowFeeConfigDialog,
  handleConfigureFee,
}: FeeConfigurationTabProps) {
  return (
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
                Set up the fee structure and payment terms for {student.name}
              </DialogDescription>
            </DialogHeader>
            <FeeConfigurationForm
              student={student}
              onSave={handleConfigureFee}
              onClose={() => setShowFeeConfigDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Fee</p>
            <p className="font-semibold text-lg">
              ₹{latestFee.totalCourseFee?.toLocaleString() ?? 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Discount</p>
            <p className="font-semibold text-lg">
              ₹{latestFee.discountAmount?.toLocaleString() ?? 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Final Fee</p>
            <p className="font-semibold text-lg text-blue-600">
              ₹{latestFee.finalFee?.toLocaleString() ?? 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Balance</p>
            <p className="font-semibold text-lg text-red-600">
              ₹{latestFee.balanceAmount?.toLocaleString() ?? 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Fee Payment Mode</p>
            <p className="font-semibold text-lg text-blue-800 capitalize">
              {latestFee.feePaymentMode ?? "N/A"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
