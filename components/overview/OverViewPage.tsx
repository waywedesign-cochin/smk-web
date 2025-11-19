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
import DarkVeil from "../DarkVeil";

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
    <div className="space-y-6 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 min-h-screen p-2 rounded-lg">
      {/* Welcome Card */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-blue-900/40 via-purple-900/30 to-indigo-900/40 border border-white/20 backdrop-blur-xl text-white shadow-2xl">
        <div className="absolute inset-0 z-0 h-[300px]">
          <DarkVeil />
        </div>
        <CardHeader className="relative z-10 flex flex-row max-xl:flex-col max-xl:gap-2 max-xl:items-start items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl max-sm:text-xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
            Welcome back, {currentUser?.username}!
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="flex items-center gap-4 flex-wrap">
            <p className="text-lg font-semibold opacity-90">
              You are logged in as{" "}
              <Badge
                variant="secondary"
                className="ml-2 bg-white/15 hover:bg-white/25 text-white border border-white/30 backdrop-blur-sm transition-all duration-200 shadow-lg"
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
                className="bg-white/15 hover:bg-white/25 text-white border border-white/30 backdrop-blur-sm mt-1 transition-all duration-200 shadow-lg"
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Quick Actions */}
          <Card className="bg-gradient-to-br from-white/5 to-white/10 border border-white/20 backdrop-blur-xl text-white shadow-2xl hover:shadow-3xl transition-all duration-300">
            <CardHeader className="border-b border-white/10 pb-4">
              <CardTitle className="flex items-center gap-3 text-xl font-semibold">
                <div className="p-2 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg">
                  <Clock className="h-5 w-5 text-green-400" />
                </div>
                Quick Actions
              </CardTitle>
              <CardDescription className="text-gray-300/80">
                Frequently used actions for faster workflow
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 pt-6">
              <Link
                href="/students"
                className="h-20 flex flex-col items-center justify-center gap-2 border border-white/20 bg-white/5 rounded-lg hover:bg-white/10 hover:border-white/30 transition-all duration-200 text-gray-300 hover:text-white group shadow-lg"
              >
                <Users className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium">Add Student</span>
              </Link>
              <Link
                href="/batches"
                className="h-20 flex flex-col items-center justify-center gap-2 border border-white/20 bg-white/5 rounded-lg hover:bg-white/10 hover:border-white/30 transition-all duration-200 text-gray-300 hover:text-white group shadow-lg"
              >
                <GraduationCap className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium">Create Batch</span>
              </Link>
              <Link
                href="/settings"
                className="h-20 flex flex-col items-center justify-center gap-2 border border-white/20 bg-white/5 rounded-lg hover:bg-white/10 hover:border-white/30 transition-all duration-200 text-gray-300 hover:text-white group shadow-lg"
              >
                <Settings className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium">Settings</span>
              </Link>
              <Link
                href="/activity-logs"
                className="h-20 flex flex-col items-center justify-center gap-2 border border-white/20 bg-white/5 rounded-lg hover:bg-white/10 hover:border-white/30 transition-all duration-200 text-gray-300 hover:text-white group shadow-lg"
              >
                <Activity className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium">Activity Logs</span>
              </Link>
            </CardContent>
          </Card>

          {/* User Role Information */}
          <Card className="bg-gradient-to-br from-white/5 to-white/10 border border-white/20 backdrop-blur-xl text-white shadow-2xl">
            <CardHeader className="border-b border-white/10 pb-4">
              <CardTitle className="flex items-center gap-3 text-xl font-semibold">
                <div className="p-2 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-blue-400" />
                </div>
                Access Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/10">
                  <span className="text-sm text-gray-300/90 font-medium">Role:</span>
                  <Badge variant="secondary" className="bg-gradient-to-r from-blue-600 to-blue-500 text-white border-0 shadow-lg">
                    {currentUser?.role === 1
                      ? "Admin"
                      : currentUser?.role === 2
                      ? "Director"
                      : "Staff"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/10">
                  <span className="text-sm text-gray-300/90 font-medium">
                    Location Access:
                  </span>
                  <span className="text-sm font-semibold text-white">
                    {currentUser?.role === 3
                      ? currentUser.location?.name || "Specific Location"
                      : "All Locations"}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/10">
                  <span className="text-sm text-gray-300/90 font-medium">Data Scope:</span>
                  <span className="text-sm font-semibold text-white">
                    {currentUser?.role === 3 ? "Location-based" : "Global"}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/10">
                  <span className="text-sm text-gray-300/90 font-medium">Year Filter:</span>
                  <span className="text-sm font-semibold text-white">
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