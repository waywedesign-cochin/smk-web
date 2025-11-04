"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { TrendingUp, Calendar, MapPin, BarChart3 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  getBatchPerformance,
  getCourseRevenue,
  getLocationsComparison,
  getPaymentTypeReport,
  getRevenueDetails,
} from "@/redux/features/reports/reportsSlice";
import { fetchLocations } from "@/redux/features/location/locationSlice";
import { PieChartIcon, GraduationCap } from "lucide-react";

import DarkVeil from "../DarkVeil";
import { fetchCurrentUser } from "@/redux/features/user/userSlice";
import RevenueChart from "./RevenueChart";
import BatchPerformanceChart from "./BatchPerformanceChart";
import LocationComparisonChart from "./LocationComparisonChart";
import PaymentMethodPie from "./PaymentMethodPie";
import CourseRevenueBar from "./CourseRevenueBar";

// Colors
const COLORS = {
  primary: "#3b82f6",
  secondary: "#8b5cf6",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  info: "#06b6d4",
};

const PIE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"];

export function ReportsPage() {
  const currentYear = new Date().getFullYear();
  const dispatch = useAppDispatch();
  const {
    revenue,
    batchPerformance,
    locationsComparison,
    paymentTypeReport,
    courseRevenue,
  } = useAppSelector((state) => state.reports);
  const { locations } = useAppSelector((state) => state.locations);
  const { currentUser } = useAppSelector((state) => state.users);
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [selectedLocation, setSelectedLocation] = useState(
    currentUser?.locationId
  );
  const [selectedQuarter, setSelectedQuarter] = useState("ALL");
  const [activeTab, setActiveTab] = useState("revenue");

  console.log(locationsComparison);

  // Fetch revenue data
  const getRevenueData = () => {
    dispatch(
      getRevenueDetails({
        year: selectedYear,
        quarter: selectedQuarter === "ALL" ? undefined : selectedQuarter,
        locationId: selectedLocation === "ALL" ? undefined : selectedLocation,
      })
    );
  };

  //get batch performance
  const getBatchPerformanceReport = () => {
    dispatch(
      getBatchPerformance({
        year: selectedYear,
        quarter: selectedQuarter === "ALL" ? undefined : selectedQuarter,
        locationId: selectedLocation === "ALL" ? undefined : selectedLocation,
      })
    );
  };

  //get location comparison
  const getLocationComparisonReport = () => {
    dispatch(
      getLocationsComparison({
        year: selectedYear,
        quarter: selectedQuarter === "ALL" ? undefined : selectedQuarter,
        locationId: selectedLocation === "ALL" ? undefined : selectedLocation,
      })
    );
  };

  //fetch payment type report
  const getPaymentMode_And_CourseRevenueReport = () => {
    dispatch(
      getPaymentTypeReport({
        locationId: selectedLocation === "ALL" ? undefined : selectedLocation,
      })
    );
    dispatch(
      getCourseRevenue({
        locationId: selectedLocation === "ALL" ? undefined : selectedLocation,
      })
    );
  };

  useEffect(() => {
    if (activeTab === "revenue") {
      getRevenueData();
    } else if (activeTab === "performance") {
      getBatchPerformanceReport();
    } else if (activeTab === "comparison") {
      getLocationComparisonReport();
    }
  }, [selectedYear, selectedLocation, selectedQuarter, activeTab]);

  // Reset selectedQuarter when activeTab changes
  useEffect(() => {
    setSelectedQuarter("ALL");
  }, [activeTab]);

  useEffect(() => {
    getPaymentMode_And_CourseRevenueReport();
  }, [selectedLocation]);

  //fetch locations
  useEffect(() => {
    if (!locations || locations.length === 0) {
      dispatch(fetchLocations());
    }
    if (!currentUser || !currentUser.id) {
      dispatch(fetchCurrentUser());
    }
  }, [locations, currentUser, dispatch]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden">
        {/* Darkveil background */}
        <div className="absolute inset-0 z-0 h-[300px] w-full">
          <DarkVeil />
        </div>
        {/* Header content */}
        <div className="relative z-10 flex justify-between max-sm:flex-col max-sm:items-start max-sm:gap-2 items-center p-5 text-white">
          <div>
            <h1 className="text-3xl font-semibold text-white">
              Reports & Analytics
            </h1>
            <p className="text-sm text-gray-300">
              Insights into revenue, enrollment, and performance
            </p>
          </div>

          {/* <Button
            className="bg-black border border-white text-white hover:bg-white hover:text-black"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button> */}
        </div>
      </div>
      {/* Filters */}
      <Card className="bg-white/10 border border-white/10 backdrop-blur-md text-white">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" /> Filter Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Year</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 3 }, (_, i) => currentYear - i).map(
                    (year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Quarter</Label>
              <Select
                value={selectedQuarter}
                onValueChange={setSelectedQuarter}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All</SelectItem>
                  <SelectItem value="Q1">Q1</SelectItem>
                  <SelectItem value="Q2">Q2</SelectItem>
                  <SelectItem value="Q3">Q3</SelectItem>
                  <SelectItem value="Q4">Q4</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Location</Label>
              <Select
                value={selectedLocation}
                onValueChange={setSelectedLocation}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Locations</SelectItem>
                  {locations?.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id ?? ""}>
                      {loc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                className="w-full border bg-black border-white hover:bg-white hover:text-black"
                onClick={() => {
                  setSelectedYear(currentYear.toString());
                  setSelectedLocation("ALL");
                  setSelectedQuarter("ALL");
                }}
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex w-full overflow-x-auto gap-2 bg-white/10 border border-white/10 backdrop-blur-md ">
          <TabsTrigger
            value="revenue"
            className="data-[state=active]:bg-blue-700 text-white rounded-lg px-4 py-2 transition"
          >
            Revenue
          </TabsTrigger>

          <TabsTrigger
            value="performance"
            className="data-[state=active]:bg-blue-700 text-white rounded-lg px-4 py-2 transition"
          >
            Performance
          </TabsTrigger>

          <TabsTrigger
            value="comparison"
            className="data-[state=active]:bg-blue-700 text-white rounded-lg px-4 py-2 transition"
          >
            Comparison
          </TabsTrigger>
        </TabsList>

        {/* Revenue Tab */}
        <TabsContent value="revenue">
          <Card className="bg-white/10 border border-white/10 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <TrendingUp className="h-5 w-5" /> Monthly Revenue Trend
              </CardTitle>
              <CardDescription className="text-white/50">
                Revenue, collections, and outstanding
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RevenueChart data={revenue} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance">
          <Card className="bg-white/10 border border-white/10 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <BarChart3 className="h-5 w-5" /> Batch Performance Overview
              </CardTitle>
              <CardDescription className="text-white/50">
                Enrollment vs capacity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BatchPerformanceChart data={batchPerformance} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comparison Tab */}
        <TabsContent value="comparison">
          <Card className="bg-white/10 border border-white/10 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <MapPin className="h-5 w-5" /> Location-wise Comparison
              </CardTitle>
              <CardDescription className="text-white/50">
                Revenue, students, and batches
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LocationComparisonChart data={locationsComparison} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Additional Analytics Section */}
      <div className="grid md:grid-cols-2 gap-4 mt-6">
        {/* Payment Method Distribution */}
        <Card className="bg-white/10 border border-white/10 backdrop-blur-md text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Payment Method Distribution
            </CardTitle>
            <CardDescription>Breakdown of payment methods used</CardDescription>
          </CardHeader>
          <CardContent>
            <PaymentMethodPie data={paymentTypeReport as []} />
          </CardContent>
        </Card>

        {/* Course Revenue Contribution */}
        <Card className="bg-white/10 border border-white/10 backdrop-blur-md text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Course Revenue Contribution
            </CardTitle>
            <CardDescription>Revenue generated by each course</CardDescription>
          </CardHeader>
          <CardContent>
            <CourseRevenueBar data={courseRevenue} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
