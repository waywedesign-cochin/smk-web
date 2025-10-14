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
import { FeeSubmission } from "./Fee/FeeConfigurationForm";
import {
  configureFee,
  fetchFeeByStudentId,
} from "@/redux/features/fee/feeSlice";
import { Fee } from "@/lib/types";
import PaymentsTab from "./Payment/PaymentTabs";
import FeeConfigurationTab from "./Fee/FeeConfigurationTab";

interface DetailsofStudentProps {
  StudentId: string;
}

const DetailsofStudent: React.FC<DetailsofStudentProps> = ({ StudentId }) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const fee = useAppSelector((state) => state.fees.fee);
  console.log(fee);

  const [showFeeConfigDialog, setShowFeeConfigDialog] = useState(false);

  const {
    currentStudent: student,
    loading,
    error,
  } = useAppSelector((state) => state.students);

  // Fetch student by ID
  useEffect(() => {
    if (StudentId) dispatch(fetchStudentById(StudentId));
  }, [dispatch, StudentId]);

  useEffect(() => {
    dispatch(fetchFeeByStudentId(StudentId));
  }, []);

  // Latest fee helper
  const latestFee = fee?.length
    ? fee[0]
    : {
        totalCourseFee: 0,
        discountAmount: 0,
        advanceAmount: 0,
        finalFee: 0,
        balanceAmount: 0,
        feePaymentMode: "",
        payments: [],
      };

  //edit fee
  const handleConfigureFee = async (fee: FeeSubmission) => {
    try {
      await dispatch(configureFee(fee)).unwrap();
      setShowFeeConfigDialog(false);
      dispatch(fetchStudentById(StudentId));
    } catch (err) {
      console.error("Failed to configure fee:", err);
    }
  };

  const onBack = () => router.back();

  if (loading)
    return (
      <p className="text-center text-muted-foreground">Loading student...</p>
    );

  if (error) return <p className="text-center text-red-500">{error}</p>;

  if (!student)
    return (
      <p className="text-center text-muted-foreground">Student not found</p>
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-semibold">{student.name}</h2>
            </div>
            <p className="text-muted-foreground">
              {student.admissionNo} •{" "}
              {student.currentBatch?.name || "No batch info"}
            </p>
          </div>
        </div>
        <Button variant="outline">
          <Edit className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
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
              ₹{latestFee.totalCourseFee?.toLocaleString() ?? 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Amount</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₹
              {latestFee.balanceAmount != null
                ? (
                    (latestFee.finalFee ?? 0) - latestFee.balanceAmount
                  ).toLocaleString()
                : 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance Due</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ₹{latestFee.balanceAmount?.toLocaleString() ?? 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Account Type</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge variant={student.isFundedAccount ? "default" : "secondary"}>
              {student.isFundedAccount ? "Funded" : "Regular"}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="fees">Fee Configuration</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Info */}
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
                  <Badge>{student?.currentBatch?.mode}</Badge>
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
          </div>
        </TabsContent>

        {/* Fee Configuration Tab */}
        <TabsContent value="fees" className="space-y-6">
          <FeeConfigurationTab
            student={student}
            latestFee={latestFee as Fee}
            showFeeConfigDialog={showFeeConfigDialog}
            setShowFeeConfigDialog={setShowFeeConfigDialog}
            handleConfigureFee={handleConfigureFee}
          />
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-6">
          <PaymentsTab latestFee={latestFee as Fee} student={student} />
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                <History className="h-4 w-4 mr-2 inline-block" />
                Student History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                No history records available.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DetailsofStudent;
