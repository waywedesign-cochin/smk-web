"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import {
  Users,
  GraduationCap,
  CreditCard,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
} from "lucide-react";
// import {
//   mockDashboardStats,
//   mockBatches,
//   mockStudents,
//   mockPayments,
// } from "../../lib/mock-data";
// import { BatchStatus, PaymentMode } from "../../types";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchBatches } from "@/redux/features/batch/batchSlice";
import { useEffect } from "react";

export function OverviewPage() {
  const dispatch = useAppDispatch();
  const { batches, pagination, loading } = useAppSelector(
    (state) => state.batches
  );
  useEffect(() => {
    dispatch(
      fetchBatches({
        status: "ACTIVE",
        limit: 0,
      })
    );
  }, [dispatch]);

  //   const stats = mockDashboardStats;

  //   const recentAdmissions = mockStudents.slice(0, 5);
  //   const recentPayments = mockPayments.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {/* {stats.totalStudents} */}
            </div>
            <p className="text-xs text-muted-foreground">
              {/* {stats.activeStudents}  */}
              currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Batches
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{batches.length}</div>
            <p className="text-xs text-muted-foreground">
              {/* {stats.completedBatches}  */}
              completed this year
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {/* ₹{(stats.totalRevenue / 100000).toFixed(1)}L */}
            </div>
            <p className="text-xs text-muted-foreground">
              {/* ₹{(stats.pendingPayments / 1000).toFixed(0)}k pending */}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              New Admissions
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {/* {stats.newAdmissions} */}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Batches */}
        <Card>
          <CardHeader>
            <CardTitle>Active Batches</CardTitle>
            <CardDescription>
              Current running batches with enrollment status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {batches.map((batch) => (
              <div
                key={batch.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{batch.name}</p>
                    <Badge
                      variant={
                        batch.course?.mode === "ONLINE"
                          ? "secondary"
                          : "default"
                      }
                    >
                      {batch.course?.mode}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {batch?.course?.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Tutor: {batch.tutor}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-sm font-medium">
                    {batch.currentCount}/{batch.slotLimit}
                  </p>
                  <Progress
                    value={(batch.currentCount / batch.slotLimit) * 100}
                    className="w-20"
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Payments */}
        {/* <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
            <CardDescription>Latest payment transactions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentPayments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="space-y-1">
                  <p className="font-medium">
                    ₹{payment.amount.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {payment.transactionId}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        payment.mode === "CASH" ? "outline" : "secondary"
                      }
                    >
                      {payment.mode}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {payment.date.toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card> */}
      </div>

      {/* Recent Activities */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>
            Latest system activities and notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 p-3 border rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium">New student admission completed</p>
              <p className="text-sm text-muted-foreground">
                Rahul Kumar enrolled in Full Stack Development batch
              </p>
              <p className="text-xs text-muted-foreground">2 hours ago</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 border rounded-lg">
            <CreditCard className="h-5 w-5 text-blue-500 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium">Payment received</p>
              <p className="text-sm text-muted-foreground">
                ₹15,000 payment from Priya Sharma via Razorpay
              </p>
              <p className="text-xs text-muted-foreground">4 hours ago</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 border rounded-lg">
            <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium">Payment reminder sent</p>
              <p className="text-sm text-muted-foreground">
                Automated payment reminder sent to 3 students
              </p>
              <p className="text-xs text-muted-foreground">6 hours ago</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 border rounded-lg">
            <Users className="h-5 w-5 text-purple-500 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium">New batch created</p>
              <p className="text-sm text-muted-foreground">
                UI/UX Design batch created for February 2024
              </p>
              <p className="text-xs text-muted-foreground">1 day ago</p>
            </div>
          </div>
        </CardContent>
      </Card> */}

      {/* Quick Actions */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Frequently used actions for faster workflow
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="outline" className="h-16 flex flex-col gap-2">
            <Users className="h-5 w-5" />
            Add Student
          </Button>
          <Button variant="outline" className="h-16 flex flex-col gap-2">
            <GraduationCap className="h-5 w-5" />
            Create Batch
          </Button>
          <Button variant="outline" className="h-16 flex flex-col gap-2">
            <CreditCard className="h-5 w-5" />
            Record Payment
          </Button>
          <Button variant="outline" className="h-16 flex flex-col gap-2">
            <TrendingUp className="h-5 w-5" />
            Generate Report
          </Button>
        </CardContent>
      </Card> */}
    </div>
  );
}
