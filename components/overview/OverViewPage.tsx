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
  Filter,
  Settings,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchBatches } from "@/redux/features/batch/batchSlice";
import { fetchLocations } from "@/redux/features/location/locationSlice";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import Link from "next/link";

export function OverviewPage() {
  const dispatch = useAppDispatch();
  const { batches, dashboardStats, loading } = useAppSelector(
    (state) => state.batches
  );
  const { currentUser } = useAppSelector((state) => state.users);
  const { locations } = useAppSelector((state) => state.locations);
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString()
  );
  const [locationFilter, setLocationFilter] = useState("all");

  // Get current year for filter options
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // Fetch locations on component mount for admin/director
  useEffect(() => {
    if (currentUser?.role === 1 || currentUser?.role === 2) {
      dispatch(fetchLocations());
    }
  }, [dispatch, currentUser]);

  //fetch current user location
  useEffect(() => {
    if (currentUser?.locationId) {
      setLocationFilter(currentUser.locationId);
    }
  }, [currentUser?.locationId]);

  // Fetch batches with filters
  useEffect(() => {
    const filters = {
      //  status: "ACTIVE",
      page: 1,
      limit: 100,
      year: selectedYear,
      location: currentUser?.locationId || locationFilter,
    };

    // For staff users, always filter by their location
    if (currentUser?.role === 3 && currentUser?.locationId) {
      filters.location = currentUser.locationId;
    }
    // For admin/director, use location filter if not "all"
    else if (
      (currentUser?.role === 1 || currentUser?.role === 2) &&
      locationFilter !== "all"
    ) {
      filters.location = locationFilter;
    }

    dispatch(fetchBatches(filters));
  }, [dispatch, currentUser, selectedYear, locationFilter]);

  // Filter batches based on user role and selected filters
  const filteredBatches = batches.filter((batch) => {
    const batchLocationId = batch.locationId || batch.location?.id;

    // Staff — only show their location batches
    if (currentUser?.role === 3 && currentUser?.locationId) {
      return batchLocationId === currentUser.locationId;
    }

    // Admin/Director — apply location filter
    if (locationFilter !== "all") {
      return batchLocationId === locationFilter;
    }

    // Otherwise — show all
    return true;
  });

  // Calculate stats based on filtered data
  const calculateStats = () => {
    const totalStudents = dashboardStats.totalEnrollment;
    const activeBatches = dashboardStats.activeBatches;
    const totalCapacity = filteredBatches.reduce(
      (sum, batch) => sum + (batch.slotLimit || 0),
      0
    );
    console.log("totalCapacity", totalCapacity);

    const occupancyRate =
      totalCapacity > 0 ? (totalStudents / totalCapacity) * 100 : 0;

    return {
      totalStudents,
      activeBatches,
      totalCapacity,
      occupancyRate,
    };
  };

  const stats = calculateStats();
  console.log("filteredBatches", filteredBatches);

  return (
    <div className="space-y-6 bg-gray-950 min-h-screen p-2 rounded-lg ">
      {/* Welcome Card */}
      <Card className="bg-gradient-to-r from-blue-800 to-purple-600/10 border-0 text-white shadow-lg">
        <CardHeader className="flex flex-row max-xl:flex-col max-xl:gap-2 max-xl:items-start items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl max-sm:text-xl font-bold">
            Welcome back, {currentUser?.username}!
          </CardTitle>
          <div className="flex max-sm:flex-col max-sm:items-start items-center gap-2">
            {(currentUser?.role === 1 || currentUser?.role === 2) && (
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-48 bg-white/20 border-white/30 text-white">
                  <Filter className="h-4 w-4 mr-2 text-white" />
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="all" className="hover:bg-gray-700">
                    All Locations
                  </SelectItem>
                  {locations?.map((location) => (
                    <SelectItem
                      key={location.id}
                      value={location.id as string}
                      className="hover:bg-gray-700"
                    >
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Select
              value={selectedYear.toString()}
              onValueChange={(value) => setSelectedYear(value)}
            >
              <SelectTrigger className="w-28 bg-white/20 border-white/30 text-white">
                <SelectValue placeholder={selectedYear.toString()} />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                {yearOptions.map((year) => (
                  <SelectItem
                    key={year}
                    value={year.toString()}
                    className="hover:bg-gray-700"
                  >
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
                  ? "Super Admin"
                  : currentUser?.role === 2
                  ? "Director"
                  : "Staff"}
              </Badge>
            </p>
            {currentUser?.location && (
              <Badge
                variant="outline"
                className="bg-white/20 text-white border-white/30"
              >
                📍 {currentUser.location.name}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card className="bg-gray-800 border-gray-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {stats.totalStudents}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Progress
                value={stats.occupancyRate}
                className="h-2 bg-gray-700 [&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-blue-500 rounded-full"
              />
              <span className="text-xs text-gray-400 whitespace-nowrap">
                {stats.occupancyRate.toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Capacity: {stats.totalStudents}/{stats.totalCapacity}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Active Batches
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {stats.activeBatches}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Running in {selectedYear}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Occupancy Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {stats.occupancyRate.toFixed(1)}%
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div
                className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(stats.occupancyRate, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Overall batch utilization
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              System Status
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">Active</div>
            <p className="text-xs text-gray-400 mt-2">
              All systems operational
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Batches */}
        <Card className="bg-[#0A1533] border border-white/10 backdrop-blur-md text-white shadow-lg">
          <CardHeader className="bg-gray-700 py-3">
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-blue-400" />
              Active Batches
            </CardTitle>
            <CardDescription className="text-gray-300">
              Currently running batches with enrollment status
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-400 mt-2">Loading batches...</p>
              </div>
            ) : filteredBatches.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No active batches found for the selected filters
              </div>
            ) : (
              filteredBatches.map((batch) => (
                <div
                  key={batch.id}
                  className="flex items-center max-sm:flex-col max-sm:items-start max-sm:gap-2  justify-between p-4 border border-gray-700 rounded-lg hover:bg-gray-750 transition-colors"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-white">{batch.name}</p>
                      <Badge
                        variant={
                          batch.course?.mode === "ONLINE"
                            ? "secondary"
                            : batch.course?.mode === "OFFLINE"
                            ? "default"
                            : "outline"
                        }
                        className="text-xs bg-gray-700 text-white border-gray-600"
                      >
                        {batch.course?.mode}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-300">
                      {batch?.course?.name}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-400 max-sm:w-full">
                      <span>Tutor: {batch.tutor || "Not assigned"}</span>
                      <span>
                        Coordinator: {batch.coordinator || "Not assigned"}
                      </span>
                    </div>
                  </div>
                  <div className="text-right max-sm:w-full space-y-2">
                    <p className="text-sm font-medium text-white">
                      {batch.currentCount}/{batch.slotLimit}
                    </p>
                    <Progress
                      value={(batch.currentCount / batch.slotLimit) * 100}
                      className="w-20  max-sm:w-full bg-gray-700 [&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-blue-500 rounded-full"
                    />
                    <p className="text-xs text-gray-400">
                      {Math.round((batch.currentCount / batch.slotLimit) * 100)}
                      % full
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Quick Actions & System Info */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="bg-gray-800 border-gray-700 text-white shadow-lg">
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
                href="/reports"
                className="h-16 flex flex-col items-center justify-center gap-2 border border-gray-700 rounded-lg hover:bg-gray-750 transition-colors text-gray-300 hover:text-white"
              >
                <TrendingUp className="h-5 w-5" />
                <span className="text-xs">Reports</span>
              </Link>
            </CardContent>
          </Card>

          {/* User Role Information */}
          <Card className="bg-gray-800 border-gray-700 text-white shadow-lg">
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
                      ? "Super Admin"
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
