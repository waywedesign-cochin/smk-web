import React from "react";
import { Student } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { History, MapPin, User } from "lucide-react";
import { Badge } from "../ui/badge";

const StudentDetailsView = ({ student }: { student: Student }) => {
  return (
    <Tabs defaultValue="profile" className="w-full space-y-6">
      {/* Tab Buttons */}
      <TabsList className="grid w-full grid-cols-3 bg-gray-100 rounded-lg p-1 shadow-sm">
        <TabsTrigger value="profile" className="rounded-lg">
          Profile
        </TabsTrigger>
        <TabsTrigger value="payments" className="rounded-lg">
          Payments
        </TabsTrigger>
        <TabsTrigger value="history" className="rounded-lg">
          History
        </TabsTrigger>
      </TabsList>

      {/* Profile Tab */}
      <TabsContent value="profile" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Info Card */}
          <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
            <h4 className="text-lg font-semibold flex items-center gap-2">
              <User className="h-5 w-5 text-indigo-500" />
              Personal Information
            </h4>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex justify-between border-b py-2">
                <span className="text-gray-400">Name:</span>
                <span>{student.name}</span>
              </div>
              <div className="flex justify-between border-b py-2">
                <span className="text-gray-400">Admission No:</span>
                <span>{student.admissionNo}</span>
              </div>
              <div className="flex justify-between border-b py-2">
                <span className="text-gray-400">Email:</span>
                <span>{student.email || "N/A"}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-400">Phone:</span>
                <span>{student.phone}</span>
              </div>
            </div>

            {student.address && (
              <div className="mt-4">
                <h4 className="text-lg font-semibold flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-indigo-500" />
                  Address
                </h4>
                <p className="text-sm text-gray-600 mt-1">{student.address}</p>
              </div>
            )}
          </div>

          {/* Current Batch & Account Info Card */}
          <div className="space-y-6">
            <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
              <h4 className="text-lg font-semibold">Current Batch</h4>
              <div className="space-y-2 text-gray-700">
                <p className="font-medium">{student?.currentBatch?.name}</p>
                <p className="text-sm text-gray-500">
                  {student?.currentBatch?.course?.name}
                </p>
                <div className="flex gap-2">
                  <Badge>{student?.currentBatch?.course?.mode}</Badge>
                  <Badge variant="outline">
                    {student?.currentBatch?.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tutor:</span>
                    <span>{student?.currentBatch?.tutor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Coordinator:</span>
                    <span>{student?.currentBatch?.coordinator}</span>
                  </div>
                  <div className="flex justify-between col-span-2">
                    <span className="text-gray-400">Location:</span>
                    <span>{student?.currentBatch?.location?.name}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
              <h4 className="text-lg font-semibold">Account Details</h4>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex justify-between">
                  <span className="text-gray-400">Account Type:</span>
                  <Badge
                    variant={student.isFundedAccount ? "default" : "secondary"}
                  >
                    {student.isFundedAccount ? "Funded" : "Regular"}
                  </Badge>
                </div>
                {student.salesperson && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Salesperson:</span>
                    <span>{student.salesperson}</span>
                  </div>
                )}
                {student.referralInfo && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Referral:</span>
                    <span>{student.referralInfo}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </TabsContent>

      {/* History Tab */}
      <TabsContent value="history" className="space-y-4">
        <div className="space-y-2">
          <h4 className="text-lg font-semibold flex items-center gap-2">
            <History className="h-5 w-5 text-indigo-500" />
            Activity History
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <div className="bg-white shadow-md rounded-lg p-4">
              <p className="text-sm">
                Enrolled in {student?.currentBatch?.name}
              </p>
              <p className="text-xs text-gray-400">
                {student?.currentBatch?.createdAt?.toLocaleDateString()}
              </p>
            </div>
            <div className="bg-white shadow-md rounded-lg p-4">
              <p className="text-sm">Account created</p>
              <p className="text-xs text-gray-400">
                Initial admission completed
              </p>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default StudentDetailsView;
