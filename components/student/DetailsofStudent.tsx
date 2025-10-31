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
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plus,
  Repeat,
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
import { fetchCommunicationLogs } from "@/redux/features/communication-log/communicationLogSlice";

interface DetailsofStudentProps {
  StudentId: string;
}

const DetailsofStudent: React.FC<DetailsofStudentProps> = ({ StudentId }) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const fee = useAppSelector((state) => state.fees.fee);

  const [showFeeConfigDialog, setShowFeeConfigDialog] = useState(false);

  const {
    currentStudent: student,
    loading,
    error,
  } = useAppSelector((state) => state.students);
  const { communicationLogs } = useAppSelector(
    (state) => state.communicationLogs
  );
  const getActivityLogs = async () => {
    dispatch(fetchCommunicationLogs({ studentId: StudentId }));
  };
  useEffect(() => {
    getActivityLogs();
  }, []);
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
      getActivityLogs();
    } catch (err) {
      console.error("Failed to configure fee:", err);
    }
  };

  const onBack = () => router.back();

  if (loading)
    return (
      <div className="flex items-center justify-center gap-2 text-gray-300">
        <Loader2 className="animate-spin h-5 w-5" />
        Loading students...
      </div>
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
        <div className="flex items-center  gap-4">
          <Button
            variant="outline"
            size="icon"
            className="text-[#f9f9fb] bg-gray-100/10"
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-semibold">
                {student.name}{" "}
                {student?.fees?.some(
                  (fee) =>
                    (fee?.batchHistoryFrom &&
                      fee?.batchHistoryFrom.length > 0) ||
                    (fee?.batchHistoryTo && fee.batchHistoryTo.length > 0)
                ) && (
                  <Badge
                    variant="outline"
                    className="text-amber-600 border-amber-300 bg-amber-50"
                  >
                    <Repeat className="h-3 w-3 mr-1" />
                    Batch Switched
                  </Badge>
                )}
              </h2>
            </div>
            <p className="text-muted-foreground">
              {student.admissionNo} •{" "}
              {student.currentBatch?.name || "No batch info"}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-blue-100/10 text-white backdrop-blur-3xl border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Course Fee</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{latestFee.totalCourseFee?.toLocaleString() ?? 0}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-100/10 text-white backdrop-blur-3xl border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Final Fee</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              ₹{latestFee.finalFee?.toLocaleString() ?? 0}
              {/* Show previous paid amount if batch switched */}
              {student?.fees?.some(
                (fee) =>
                  (fee?.batchHistoryFrom && fee?.batchHistoryFrom.length > 0) ||
                  (fee?.batchHistoryTo && fee.batchHistoryTo.length > 0)
              ) &&
                student?.fees?.[1] && (
                  <div className="text-sm font-medium text-muted-foreground mt-1">
                    (Previously paid ₹
                    {(
                      (student.fees[1].finalFee ?? 0) -
                      (student.fees[1].balanceAmount ?? 0)
                    ).toLocaleString()}{" "}
                    on {student.fees[0].batchHistoryTo?.[0]?.fromBatch?.name})
                  </div>
                )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-100/10 text-white backdrop-blur-3xl border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Amount</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div>
              {/* Main Paid Amount */}
              <div className="text-2xl font-bold text-green-600">
                ₹
                {latestFee.balanceAmount != null
                  ? (
                      (latestFee.finalFee ?? 0) - latestFee.balanceAmount
                    ).toLocaleString()
                  : 0}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-100/10 text-white backdrop-blur-3xl border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance Due</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                latestFee.balanceAmount === 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {latestFee?.balanceAmount === 0
                ? "PAID"
                : `₹${latestFee.balanceAmount?.toLocaleString() ?? 0}`}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs
        className=" bg-gradient-to-br from-[#122147] via-black to-[#122147]  rounded-xl p-6   transition-shadow duration-300 space-y-6 w-full"
        defaultValue="overview"
        // className="w-full"
      >
        <TabsList>
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-black data-[state=active]:text-white"
          >
            Overview
          </TabsTrigger>

          <TabsTrigger
            value="fees"
            className="data-[state=active]:bg-black data-[state=active]:text-white"
          >
            Fee Configuration
          </TabsTrigger>

          {student?.fees?.[0]?.feePaymentMode && (
            <TabsTrigger
              value="payments"
              className="data-[state=active]:bg-black data-[state=active]:text-white"
            >
              Payments
            </TabsTrigger>
          )}

          <TabsTrigger
            value="history"
            className="data-[state=active]:bg-black data-[state=active]:text-white"
          >
            History
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Info */}
            <Card className="bg-blue-100/10 text-white backdrop-blur-3xl border-0">
              <CardHeader className="flex flex-row bg-[#122147] items-center justify-between space-y-0 py-4">
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
            <Card className="bg-blue-100/10 text-white backdrop-blur-3xl border-0">
              <CardHeader className="flex flex-row bg-[#122147] items-center justify-between space-y-0 py-4">
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
                  <Badge variant="secondary">
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
          {student?.fees?.some(
            (fee) =>
              (fee?.batchHistoryFrom && fee?.batchHistoryFrom.length > 0) ||
              (fee?.batchHistoryTo && fee.batchHistoryTo.length > 0)
          ) && (
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
                {student?.fees?.[0]?.batchHistoryTo?.map((fee) => {
                  return (
                    <div
                      key={fee.id}
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
                              {fee.changeDate
                                ? new Date(fee.changeDate).toLocaleDateString(
                                    "en-GB"
                                  )
                                : null}
                            </span>
                          </div>
                          <div className="text-sm space-y-1 mt-2">
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">
                                From:
                              </span>
                              <span className="font-medium">
                                {fee.fromBatch.name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                ({fee.fromBatch?.course?.name})
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">To:</span>
                              <span className="font-medium">
                                {fee.toBatch.name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                ({fee.toBatch?.course?.name})
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="border-t pt-2 space-y-2">
                        {/* Previous Fee */}
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Previous Fee:
                          </span>
                          <span>
                            ₹
                            {student?.fees?.[1]?.finalFee?.toLocaleString() ??
                              0}
                          </span>
                        </div>

                        {/* New Fee */}
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            New Course Fee:
                          </span>
                          <span>
                            ₹
                            {student?.fees?.[0]?.finalFee?.toLocaleString() ??
                              0}
                          </span>
                        </div>

                        {/* Previously paid info (muted, below) */}
                        {student?.fees?.[1] &&
                          student.fees[1].finalFee !==
                            student.fees[1].balanceAmount && (
                            <div className="text-xs text-muted-foreground text-right">
                              (Previously paid ₹
                              {(
                                (student.fees[1].finalFee ?? 0) -
                                (student.fees[1].balanceAmount ?? 0)
                              ).toLocaleString()}{" "}
                              on{" "}
                              {student.fees[0]?.batchHistoryTo?.[0]?.fromBatch
                                ?.name ?? "previous batch"}
                              )
                            </div>
                          )}
                      </div>

                      {fee.reason && (
                        <div className="border-t pt-2">
                          <p className="text-xs text-muted-foreground">
                            Reason:
                          </p>
                          <p className="text-sm mt-1">{fee.reason}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Activity Log
              </CardTitle>
              <CardDescription>Recent activities and updates</CardDescription>
            </CardHeader>
            {communicationLogs?.map((log) => (
              <CardContent key={log.id} className="space-y-2">
                <div className="border rounded-lg p-3">
                  <p className="text-sm">{log.subject}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(log.date).toLocaleString()}
                  </p>
                  <div className="border rounded-lg p-3 mt-2">
                    <p className="text-xs text-muted-foreground">
                      {log.message}
                    </p>
                  </div>
                </div>
              </CardContent>
            ))}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DetailsofStudent;
