"use client";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Plus,
  Edit,
  Eye,
  Users,
  MapPin,
  Calendar,
  GraduationCap,
  User,
  BookOpen,
} from "lucide-react";
import { CreateBatchForm } from "./createBatchForm";
import { Batch, BatchMode, BatchStatus } from "@/lib/types";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  addBatch,
  fetchBatches,
  updateBatch,
} from "@/redux/features/batch/batchSlice";

export function Batches() {
  const dispatch = useAppDispatch();
  const batchesWithPagination = useAppSelector(
    (state) => state.batches.batches
  );
  useEffect(() => {
    dispatch(fetchBatches());
  }, []);

  console.log("batchesWithPagination", batchesWithPagination);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);

  // const filteredBatches = batches.filter((batch) => {
  //   const matchesSearch =
  //     batch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     batch?.course?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     batch.tutor?.toLowerCase().includes(searchTerm.toLowerCase());

  //   const matchesStatus =
  //     statusFilter === "all" || batch.status === statusFilter;

  //   return matchesSearch && matchesStatus;
  // });

  const getStatusColor = (status: BatchStatus) => {
    switch (status) {
      case "ACTIVE":
        return "default";
      case "COMPLETED":
        return "secondary";
      case "CANCELLED":
        return "destructive";
      case "PENDING":
        return "warning";
      default:
        return "outline";
    }
  };

  const getModeColor = (mode: BatchMode) => {
    switch (mode) {
      case "ONLINE":
        return "secondary";
      case "OFFLINE":
        return "default";

      default:
        return "outline";
    }
  };

  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);

  /**
   * Handles creating a new batch or updating an existing batch.
   * If isEdit is true, it will update the batch with the given batchData.
   * If isEdit is false, it will create a new batch with the given batchData.
   * After creating or updating the batch, it will close the create batch form.
   * @param {Batch} batchData - The data of the batch to be created or updated.
   * @param {boolean} isEdit - Whether the batch is being updated or created.
   */
  const handleCreateBatch = (batchData: Batch, isEdit: boolean) => {
    // In a real app, this would make an API call
    console.log("Creating batch:", batchData);
    if (isEdit) {
      dispatch(updateBatch(batchData));
    } else {
      // add new course
      dispatch(addBatch(batchData));
    }
    setIsCreateFormOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-semibold">Batch Management</h2>
          <p className="text-muted-foreground">
            Manage course batches, schedules, and enrollments
          </p>
        </div>
        <div className="flex gap-2">
          <Sheet open={isCreateFormOpen} onOpenChange={setIsCreateFormOpen}>
            <SheetTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Batch
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Create New Batch</SheetTitle>
                <SheetDescription>
                  Set up a new batch with course, location, and capacity details
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                {/* <CreateBatchForm
                  editingBatch={editingBatch}
                  setEditingBatch={setEditingBatch}
                  onSubmit={handleCreateBatch}
                  onCancel={() => setIsCreateFormOpen(false)}
                /> */}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter Batches</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by batch name, course, or tutor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md"
            >
              <option value="all">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Batch Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-full">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Batches</p>
                <p className="text-xl font-bold">
                  {/* {batches.filter((b) => b.status === "ACTIVE").length} */}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <GraduationCap className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Enrollment
                </p>
                <p className="text-xl font-bold">
                  {/* {batches.reduce((sum, batch) => sum + batch.currentCount, 0)} */}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-2 rounded-full">
                <BookOpen className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Available Slots</p>
                <p className="text-xl font-bold">
                  {/* {batches.reduce(
                    (sum, batch) =>
                      sum + (batch.slotLimit - batch.currentCount),
                    0
                  )} */}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Batches Table */}
      <Card>
        <CardHeader>
          {/* <CardTitle>Batches List ({filteredBatches?.length})</CardTitle> */}
          <CardDescription>All course batches in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch Details</TableHead>
                <TableHead>Course & Location</TableHead>
                <TableHead>Instructors</TableHead>
                <TableHead>Enrollment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* {filteredBatches.map((batch) => (
                <TableRow key={batch.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium">{batch.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Year {batch.year}
                      </p>
                      <div className="flex gap-1">
                        <Badge
                          variant={getModeColor(batch.mode)}
                          className="text-xs"
                        >
                          {batch.mode}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium">{batch.course.name}</p>
                      <p className="text-sm text-muted-foreground">
                        ₹{batch.course.baseFee.toLocaleString()}
                      </p>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {batch.location.name}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <User className="h-3 w-3" />
                        {batch.tutor || "TBD"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Coordinator: {batch.coordinator || "TBD"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>
                          {batch.currentCount}/{batch.slotLimit}
                        </span>
                        <span>
                          {Math.round(
                            (batch.currentCount / batch.slotLimit) * 100
                          )}
                          %
                        </span>
                      </div>
                      <Progress
                        value={(batch.currentCount / batch.slotLimit) * 100}
                        className="h-2"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(batch.status)}>
                      {batch.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedBatch(batch)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-6xl w-full max-h-[80vh] overflow-auto">
                          <DialogHeader>
                            <DialogTitle>Batch Details</DialogTitle>
                            <DialogDescription>
                              Complete information for {batch.name}
                            </DialogDescription>
                          </DialogHeader>
                          {selectedBatch && (
                            <BatchDetailView batch={selectedBatch} />
                          )}
                        </DialogContent>
                      </Dialog>

                      <Button variant="outline" size="sm">
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))} */}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function BatchDetailView({ batch }: { batch: Batch }) {
  // Get students for this batch (mock implementation)
  // const batchStudents = mockStudents.filter(
  //   (student) => student.currentBatchId === batch.id
  // );
  const batchStudents = [];

  return (
    // <Tabs defaultValue="overview" className="w-full">
    //   <TabsList className="grid w-full grid-cols-3">
    //     <TabsTrigger value="overview">Overview</TabsTrigger>
    //     <TabsTrigger value="students">
    //       Students ({batchStudents.length})
    //     </TabsTrigger>
    //     <TabsTrigger value="schedule">Schedule</TabsTrigger>
    //   </TabsList>

    //   <TabsContent value="overview" className="space-y-4">
    //     <div className="grid grid-cols-2 gap-6">
    //       <div className="space-y-4">
    //         <div className="space-y-2">
    //           <h4 className="font-medium">Batch Information</h4>
    //           <div className="border rounded-lg p-4 space-y-3">
    //             <div className="flex justify-between">
    //               <span className="text-muted-foreground">Batch Name:</span>
    //               <span className="font-medium">{batch.name}</span>
    //             </div>
    //             <div className="flex justify-between">
    //               <span className="text-muted-foreground">Year:</span>
    //               <span>{batch.year}</span>
    //             </div>
    //             <div className="flex justify-between">
    //               <span className="text-muted-foreground">Mode:</span>
    //               <Badge variant={getModeColor(batch.mode)}>{batch.mode}</Badge>
    //             </div>
    //             <div className="flex justify-between">
    //               <span className="text-muted-foreground">Status:</span>
    //               <Badge variant={getStatusColor(batch.status)}>
    //                 {batch.status}
    //               </Badge>
    //             </div>
    //             <div className="flex justify-between">
    //               <span className="text-muted-foreground">Created:</span>
    //               <span>{batch.createdAt as string}</span>
    //             </div>
    //           </div>
    //         </div>

    //         <div className="space-y-2">
    //           <h4 className="font-medium">Course Details</h4>
    //           <div className="border rounded-lg p-4 space-y-3">
    //             <div className="flex justify-between">
    //               <span className="text-muted-foreground">Course:</span>
    //               <span className="font-medium">{batch.course.name}</span>
    //             </div>
    //             <div className="flex justify-between">
    //               <span className="text-muted-foreground">Base Fee:</span>
    //               <span>₹{batch.course.baseFee.toLocaleString()}</span>
    //             </div>
    //             {batch.course.description && (
    //               <div className="space-y-1">
    //                 <span className="text-muted-foreground">Description:</span>
    //                 <p className="text-sm">{batch.course.description}</p>
    //               </div>
    //             )}
    //           </div>
    //         </div>
    //       </div>

    //       <div className="space-y-4">
    //         <div className="space-y-2">
    //           <h4 className="font-medium">Enrollment Statistics</h4>
    //           <div className="border rounded-lg p-4 space-y-3">
    //             <div className="flex justify-between">
    //               <span className="text-muted-foreground">Slot Limit:</span>
    //               <span>{batch.slotLimit}</span>
    //             </div>
    //             <div className="flex justify-between">
    //               <span className="text-muted-foreground">Current Count:</span>
    //               <span className="font-medium">{batch.currentCount}</span>
    //             </div>
    //             <div className="flex justify-between">
    //               <span className="text-muted-foreground">
    //                 Available Slots:
    //               </span>
    //               <span className="text-green-600">
    //                 {batch.slotLimit - batch.currentCount}
    //               </span>
    //             </div>
    //             <div className="space-y-2">
    //               <div className="flex justify-between text-sm">
    //                 <span>Enrollment Progress</span>
    //                 <span>
    //                   {Math.round((batch.currentCount / batch.slotLimit) * 100)}
    //                   %
    //                 </span>
    //               </div>
    //               <Progress
    //                 value={(batch.currentCount / batch.slotLimit) * 100}
    //               />
    //             </div>
    //           </div>
    //         </div>

    //         <div className="space-y-2">
    //           <h4 className="font-medium">Staff Assignment</h4>
    //           <div className="border rounded-lg p-4 space-y-3">
    //             <div className="flex justify-between">
    //               <span className="text-muted-foreground">Tutor:</span>
    //               <span>{batch.tutor || "Not Assigned"}</span>
    //             </div>
    //             <div className="flex justify-between">
    //               <span className="text-muted-foreground">Coordinator:</span>
    //               <span>{batch.coordinator || "Not Assigned"}</span>
    //             </div>
    //             <div className="flex justify-between">
    //               <span className="text-muted-foreground">Location:</span>
    //               <span>{batch.location.name}</span>
    //             </div>
    //           </div>
    //         </div>
    //       </div>
    //     </div>
    //   </TabsContent>

    //   <TabsContent value="students" className="space-y-4">
    //     <div className="space-y-4">
    //       <div className="flex justify-between items-center">
    //         <h4 className="font-medium">Enrolled Students</h4>
    //         <Button size="sm">
    //           <Plus className="h-4 w-4 mr-2" />
    //           Enroll Student
    //         </Button>
    //       </div>

    //       <div className="space-y-2">
    //         {/* {batchStudents.map((student) => (
    //           <div
    //             key={student.id}
    //             className="border rounded-lg p-3 flex justify-between items-center"
    //           >
    //             <div className="space-y-1">
    //               <p className="font-medium">{student.name}</p>
    //               <p className="text-sm text-muted-foreground">
    //                 {student.admissionNo}
    //               </p>
    //               <div className="flex items-center gap-4 text-xs text-muted-foreground">
    //                 <span>{student.phone}</span>
    //                 {student.email && <span>{student.email}</span>}
    //               </div>
    //             </div>
    //             <div className="flex gap-2">
    //               <Badge
    //                 variant={student.isFundedAccount ? "default" : "secondary"}
    //               >
    //                 {student.isFundedAccount ? "Funded" : "Regular"}
    //               </Badge>
    //               <Button variant="outline" size="sm">
    //                 View
    //               </Button>
    //             </div>
    //           </div>
    //         ))} */}

    //         {/* {batchStudents.length === 0 && (
    //           <div className="text-center py-8 text-muted-foreground">
    //             No students enrolled in this batch yet.
    //           </div>
    //         )} */}
    //       </div>
    //     </div>
    //   </TabsContent>

    //   <TabsContent value="schedule" className="space-y-4">
    //     <div className="space-y-4">
    //       <h4 className="font-medium flex items-center gap-2">
    //         <Calendar className="h-4 w-4" />
    //         Batch Schedule
    //       </h4>

    //       <div className="border rounded-lg p-4">
    //         <p className="text-muted-foreground">
    //           Schedule management feature will be available soon. Currently
    //           showing batch timing and session information.
    //         </p>

    //         <div className="mt-4 space-y-2">
    //           <div className="flex justify-between">
    //             <span className="text-muted-foreground">Start Date:</span>
    //             <span>{batch.createdAt}</span>
    //           </div>
    //           <div className="flex justify-between">
    //             <span className="text-muted-foreground">Mode:</span>
    //             <span>{batch.mode}</span>
    //           </div>
    //           <div className="flex justify-between">
    //             <span className="text-muted-foreground">Duration:</span>
    //             <span>3-6 months (Course dependent)</span>
    //           </div>
    //         </div>
    //       </div>
    //     </div>
    //   </TabsContent>
    // </Tabs>
    <></>
  );
}

function getModeColor(
  mode: BatchMode
): "default" | "secondary" | "destructive" | "outline" {
  switch (mode) {
    case "ONLINE":
      return "secondary";
    case "OFFLINE":
      return "default";
    case "HYBRID":
      return "outline";
    default:
      return "outline";
  }
}

function getStatusColor(
  status: BatchStatus
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "ACTIVE":
      return "default";
    case "COMPLETED":
      return "secondary";
    case "CANCELLED":
      return "destructive";
    default:
      return "outline";
  }
}
