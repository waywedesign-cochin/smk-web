"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import {
  Users,
  GraduationCap,
  CreditCard,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Filter,
  Settings,
  Loader2,
  Activity,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchLocations } from "@/redux/features/location/locationSlice";
import { useEffect, useState } from "react";

import Link from "next/link";
import { ReportsPage } from "../Reports/ReportsPage";

export function OverviewPage() {
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state) => state.users);
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString()
  );

  // Fetch locations on component mount for admin/director
  useEffect(() => {
    if (currentUser?.role === 1 || currentUser?.role === 2) {
      dispatch(fetchLocations());
    }
  }, [dispatch, currentUser]);

  return (
    <div className="space-y-6 bg-gray-950 min-h-screen p-2 rounded-lg ">
      {/* Welcome Card */}
      <Card className="bg-gradient-to-r from-blue-800 to-purple-600/10 border-0 text-white shadow-lg">
        <CardHeader className="flex flex-row max-xl:flex-col max-xl:gap-2 max-xl:items-start items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl max-sm:text-xl font-bold">
            Welcome back, {currentUser?.username}!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 flex-wrap">
            <p className="text-lg font-semibold opacity-90">
              You are logged in as{" "}
              <Badge
                variant="secondary"
                className="ml-2 bg-white/20 text-white border-white/30"
              >
                {currentUser?.role === 1
                  ? "Admin"
                  : currentUser?.role === 2
                  ? "Director"
                  : "Staff"}
              </Badge>
            </p>
            {currentUser?.location && (
              <Badge
                variant="outline"
                className="bg-white/20 text-white border-white/30 mt-1"
              >
                📍 {currentUser.location.name}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <div>
        {/* Reports Section */}
        <ReportsPage />

        {/* Quick Actions & System Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 ">
          {/* Quick Actions */}
          <Card className="bg-white/10 border-gray-700 text-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-400" />
                Quick Actions
              </CardTitle>
              <CardDescription className="text-gray-300">
                Frequently used actions for faster workflow
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <Link
                href="/students"
                className="h-16 flex flex-col items-center justify-center gap-2 border border-gray-700 rounded-lg hover:bg-gray-750 transition-colors text-gray-300 hover:text-white"
              >
                <Users className="h-5 w-5" />
                <span className="text-xs">Add Student</span>
              </Link>
              <Link
                href="/batches"
                className="h-16 flex flex-col items-center justify-center gap-2 border border-gray-700 rounded-lg hover:bg-gray-750 transition-colors text-gray-300 hover:text-white"
              >
                <GraduationCap className="h-5 w-5" />
                <span className="text-xs">Create Batch</span>
              </Link>
              <Link
                href="/settings"
                className="h-16 flex flex-col items-center justify-center gap-2 border border-gray-700 rounded-lg hover:bg-gray-750 transition-colors text-gray-300 hover:text-white"
              >
                <Settings className="h-5 w-5" />
                <span className="text-xs">Settings</span>
              </Link>
              <Link
                href="/activity-logs"
                className="h-16 flex flex-col items-center justify-center gap-2 border border-gray-700 rounded-lg hover:bg-gray-750 transition-colors text-gray-300 hover:text-white"
              >
                <Activity className="h-5 w-5" />
                <span className="text-xs">Activity Logs</span>
              </Link>
            </CardContent>
          </Card>

          {/* User Role Information */}
          <Card className="bg-white/10 border-gray-700 text-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-blue-400" />
                Access Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">Role:</span>
                  <Badge variant="secondary" className="bg-blue-600 text-white">
                    {currentUser?.role === 1
                      ? "Admin"
                      : currentUser?.role === 2
                      ? "Director"
                      : "Staff"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">
                    Location Access:
                  </span>
                  <span className="text-sm font-medium text-white">
                    {currentUser?.role === 3
                      ? currentUser.location?.name || "Specific Location"
                      : "All Locations"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">Data Scope:</span>
                  <span className="text-sm font-medium text-white">
                    {currentUser?.role === 3 ? "Location-based" : "Global"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">Year Filter:</span>
                  <span className="text-sm font-medium text-white">
                    {selectedYear}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
