"use client";

import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FileText,
  History,
  Link2,
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
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [showFeeConfigDialog, setShowFeeConfigDialog] = useState(false);

  const {
    currentStudent: student,
    loading,
    error,
  } = useAppSelector((state) => state.students);
  const { communicationLogs, pagination } = useAppSelector(
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
        status: "",
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

  //handle page change
  const handlePageChange = (newPage: number) => {
    dispatch(
      fetchCommunicationLogs({
        page: newPage,
        limit: itemsPerPage,
        studentId: StudentId,
      })
    );
  };

  const onBack = () => router.back();

  if (loading)
    return (
      <div className="flex items-center justify-center h-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading student info...</p>
        </div>
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
              <h2 className="text-2xl font-semibold capitalize">
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
      <div className="grid max-sm:grid-cols-1 sm:grid-cols-2  lg:grid-cols-4 gap-4">
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
                {latestFee.status === "REFUNDED"
                  ? 0
                  : latestFee.balanceAmount != null
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
                latestFee.status === "PAID"
                  ? "text-green-600"
                  : latestFee.status === "PENDING"
                  ? "text-yellow-600"
                  : latestFee.status === "REFUNDED"
                  ? "text-blue-600"
                  : "text-red-600"
              }`}
            >
              {latestFee.balanceAmount !== 0
                ? `₹${latestFee.balanceAmount?.toLocaleString() ?? 0}`
                : latestFee.status}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs
        className=" bg-gradient-to-br from-[#122147] via-black to-[#122147]  rounded-xl p-6   transition-shadow duration-300 space-y-6 w-full"
        defaultValue="overview"
      >
        <TabsList
          className="
    inline-flex
    w-full
    overflow-x-auto
    whitespace-nowrap
    no-scrollbar
        bg-gradient-to-b from-gray-800/40 to-gray-900/40
        backdrop-blur-xl
    border border-white/10
    rounded-xl
    shadow-lg shadow-black/20    p-1
  "
        >
          <div className="inline-flex gap-1 min-w-full h-full">
            <TabsTrigger
              value="overview"
              className="
              text-gray-400
              data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-600 data-[state=active]:to-blue-700
              data-[state=active]:text-white
              data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/30
              hover:bg-white/5
              hover:text-gray-200
              transition-all duration-300
              px-5 py-2.5 rounded-lg text-sm font-medium flex-shrink-0
            "
            >
              Overview
            </TabsTrigger>

            <TabsTrigger
              value="fees"
              className="
              text-gray-400
              data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-600 data-[state=active]:to-blue-700
              data-[state=active]:text-white
              data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/30
              hover:bg-white/5
              hover:text-gray-200
              transition-all duration-300
              px-5 py-2.5 rounded-lg text-sm font-medium flex-shrink-0
            "
            >
              Fee Configuration
            </TabsTrigger>

            {(student?.fees?.[0]?.feePaymentMode ||
              (student?.fees?.[0]?.payments?.length ?? 0) > 0) && (
              <TabsTrigger
                value="payments"
                className="
        text-gray-400
        data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-600 data-[state=active]:to-blue-700
        data-[state=active]:text-white
        data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/30
        hover:bg-white/5
        hover:text-gray-200
        transition-all duration-300
        px-5 py-2.5 rounded-lg text-sm font-medium flex-shrink-0
      "
              >
                Payments
              </TabsTrigger>
            )}

            <TabsTrigger
              value="history"
              className="
              text-gray-400
              data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-600 data-[state=active]:to-blue-700
              data-[state=active]:text-white
              data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/30
              hover:bg-white/5
              hover:text-gray-200
              transition-all duration-300
              px-5 py-2.5 rounded-lg text-sm font-medium flex-shrink-0
            "
            >
              History
            </TabsTrigger>
          </div>
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
                {student.referralInfo && (
                  <div className="flex items-center gap-3 text-sm">
                    <Link2 className="h-4 w-4 text-muted-foreground" />
                    <span>{student.referralInfo}</span>
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
          {/* Batch Switch History */}
          {student?.fees?.some(
            (fee) =>
              (fee?.batchHistoryFrom && fee?.batchHistoryFrom.length > 0) ||
              (fee?.batchHistoryTo && fee.batchHistoryTo.length > 0)
          ) && (
            <Card className="bg-[#0E1628] border border-white/10 text-gray-200 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-100">
                  <Repeat className="h-4 w-4" />
                  Batch Switch History
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Complete history of batch changes
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                {student?.fees?.[0]?.batchHistoryTo?.map((fee) => {
                  return (
                    <div
                      key={fee.id}
                      className="border border-amber-500/20 bg-amber-900/10 rounded-lg p-4 space-y-3 shadow-sm"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="text-amber-400 border-amber-400/50"
                            >
                              Batch Switched
                            </Badge>
                            <span className="text-xs text-gray-400">
                              {fee.changeDate
                                ? new Date(fee.changeDate).toLocaleDateString(
                                    "en-GB"
                                  )
                                : null}
                            </span>
                          </div>

                          <div className="text-sm space-y-1 mt-2 text-gray-200">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400">From:</span>
                              <span className="font-medium">
                                {fee.fromBatch.name}
                              </span>
                              <span className="text-xs text-gray-400">
                                ({fee.fromBatch?.course?.name})
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-gray-400">To:</span>
                              <span className="font-medium">
                                {fee.toBatch.name}
                              </span>
                              <span className="text-xs text-gray-400">
                                ({fee.toBatch?.course?.name})
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-white/10 pt-2 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Previous Fee:</span>
                          <span className="text-gray-200">
                            ₹
                            {student?.fees?.[1]?.finalFee?.toLocaleString() ??
                              0}
                          </span>
                        </div>

                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">New Course Fee:</span>
                          <span className="text-gray-200">
                            ₹
                            {student?.fees?.[0]?.finalFee?.toLocaleString() ??
                              0}
                          </span>
                        </div>

                        {student?.fees?.[1] &&
                          student.fees[1].finalFee !==
                            student.fees[1].balanceAmount && (
                            <div className="text-xs text-gray-400 text-right">
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
                        <div className="border-t border-white/10 pt-2">
                          <p className="text-xs text-gray-400">Reason:</p>
                          <p className="text-sm mt-1 text-gray-200">
                            {fee.reason}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Activity Log */}
          <Card className="bg-[#0E1628] border border-white/10 text-gray-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-100">
                <History className="h-4 w-4" />
                Activity Log
              </CardTitle>
              <CardDescription className="text-gray-400">
                Recent activities and updates
              </CardDescription>
            </CardHeader>

            {communicationLogs?.map((log) => (
              <CardContent
                key={log.id}
                className="bg-black/20 border-b border-white/10 last:border-b-0"
              >
                <div className="border border-white/10 rounded-lg p-3 bg-black/30">
                  <p className="text-sm text-gray-100">{log.subject}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(log.date).toLocaleString()}
                  </p>

                  <div className="border border-white/10 rounded-lg p-3 mt-2 bg-black/40">
                    <p className="text-xs text-gray-300">{log.message}</p>
                  </div>
                </div>
              </CardContent>
            ))}
            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-end mt-6 px-4">
                {/* Pagination buttons */}
                <div className="flex items-center gap-2">
                  {/* Previous */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  {/* Page numbers */}
                  {Array.from(
                    { length: pagination.totalPages },
                    (_, i) => i + 1
                  )
                    .filter(
                      (page) =>
                        page === 1 ||
                        page === pagination.totalPages ||
                        Math.abs(page - pagination.currentPage) <= 1
                    )
                    .map((page, index, array) => {
                      const showEllipsis =
                        index < array.length - 1 && array[index + 1] - page > 1;
                      const isActive = pagination.currentPage === page;
                      return (
                        <div key={page} className="flex items-center">
                          <Button
                            variant={isActive ? "default" : "ghost"}
                            size="sm"
                            onClick={() => handlePageChange(page)}
                            className={`${
                              isActive
                                ? "bg-gradient-to-r from-blue-500 to-purple-700 text-white shadow-md"
                                : "bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/10"
                            }`}
                          >
                            {page}
                          </Button>
                          {showEllipsis && (
                            <span className="px-2 text-gray-500 select-none">
                              ...
                            </span>
                          )}
                        </div>
                      );
                    })}

                  {/* Next */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DetailsofStudent;
