"use client";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Search,
  Plus,
  Edit,
  Eye,
  Phone,
  Mail,
  MapPin,
  User,
  CreditCard,
  History,
} from "lucide-react";
import { Student } from "@/lib/types";
// import { mockStudents, mockPayments } from "../../lib/mock-data";
// import { Student } from "../../types";
// import { AddStudentForm } from "../add-student-form";

export function Students() {
  const [searchTerm, setSearchTerm] = useState("");
  //   const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);

  //   const filteredStudents = mockStudents?.filter(
  //     (student) =>
  //       student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //       student.admissionNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //       student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //       student.phone.includes(searchTerm)
  //   );
  const filteredStudents: Student[] = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAddStudent = (studentData: any) => {
    // In a real app, this would make an API call
    console.log("Adding student:", studentData);
    setIsAddFormOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-semibold">Students Management</h2>
          <p className="text-muted-foreground">
            Manage student records and track their progress
          </p>
        </div>
        <div className="flex gap-2">
          <Sheet open={isAddFormOpen} onOpenChange={setIsAddFormOpen}>
            <SheetTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Student
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Add New Student</SheetTitle>
                <SheetDescription>
                  Create a new student record and enroll them in a batch
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                {/* <AddStudentForm
                  onSubmit={handleAddStudent}
                  onCancel={() => setIsAddFormOpen(false)}
                /> */}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search Students</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, admission no, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          {/* <CardTitle>Students List ({filteredStudents.length})</CardTitle> */}
          <CardDescription>
            All registered students in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Details</TableHead>
                <TableHead>Contact Info</TableHead>
                <TableHead>Current Batch</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents?.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {student.admissionNo}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-3 w-3" />
                        {student.email || "N/A"}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-3 w-3" />
                        {student.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium">{student.currentBatch.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {student.currentBatch.course.name}
                      </p>
                      <Badge variant="outline">
                        {student.currentBatch.mode}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Badge
                        variant={
                          student.isFundedAccount ? "default" : "secondary"
                        }
                      >
                        {student.isFundedAccount ? "Funded" : "Regular"}
                      </Badge>
                      {student.salesperson && (
                        <p className="text-xs text-muted-foreground">
                          Sales: {student.salesperson}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            // onClick={() => setSelectedStudent(student)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
                          <DialogHeader>
                            <DialogTitle>Student Details</DialogTitle>
                            <DialogDescription>
                              Complete information for {student.name}
                            </DialogDescription>
                          </DialogHeader>
                          {/* {selectedStudent && (
                            <StudentDetailView student={selectedStudent} />
                          )} */}
                        </DialogContent>
                      </Dialog>

                      <Button variant="outline" size="sm">
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// function StudentDetailView({ student }: { student: Student }) {
//   return (
//     <Tabs defaultValue="profile" className="w-full">
//       <TabsList className="grid w-full grid-cols-3">
//         <TabsTrigger value="profile">Profile</TabsTrigger>
//         <TabsTrigger value="payments">Payments</TabsTrigger>
//         <TabsTrigger value="history">History</TabsTrigger>
//       </TabsList>

//       <TabsContent value="profile" className="space-y-4">
//         <div className="grid grid-cols-2 gap-4">
//           <div className="space-y-4">
//             <div className="space-y-2">
//               <h4 className="font-medium flex items-center gap-2">
//                 <User className="h-4 w-4" />
//                 Personal Information
//               </h4>
//               <div className="space-y-2 text-sm">
//                 <div className="flex justify-between">
//                   <span className="text-muted-foreground">Name:</span>
//                   <span>{student.name}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-muted-foreground">Admission No:</span>
//                   <span>{student.admissionNo}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-muted-foreground">Email:</span>
//                   <span>{student.email || "N/A"}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-muted-foreground">Phone:</span>
//                   <span>{student.phone}</span>
//                 </div>
//               </div>
//             </div>

//             {student.address && (
//               <div className="space-y-2">
//                 <h4 className="font-medium flex items-center gap-2">
//                   <MapPin className="h-4 w-4" />
//                   Address
//                 </h4>
//                 <p className="text-sm text-muted-foreground">
//                   {student.address}
//                 </p>
//               </div>
//             )}
//           </div>

//           <div className="space-y-4">
//             <div className="space-y-2">
//               <h4 className="font-medium">Current Batch</h4>
//               <div className="border rounded-lg p-3 space-y-2">
//                 <p className="font-medium">{student.currentBatch.name}</p>
//                 <p className="text-sm text-muted-foreground">
//                   {student.currentBatch.course.name}
//                 </p>
//                 <div className="flex gap-2">
//                   <Badge>{student.currentBatch.mode}</Badge>
//                   <Badge variant="outline">{student.currentBatch.status}</Badge>
//                 </div>
//                 <div className="text-sm space-y-1">
//                   <p>Tutor: {student.currentBatch.tutor}</p>
//                   <p>Coordinator: {student.currentBatch.coordinator}</p>
//                   <p>Location: {student.currentBatch.location.name}</p>
//                 </div>
//               </div>
//             </div>

//             <div className="space-y-2">
//               <h4 className="font-medium">Account Details</h4>
//               <div className="space-y-2 text-sm">
//                 <div className="flex justify-between">
//                   <span className="text-muted-foreground">Account Type:</span>
//                   <Badge
//                     variant={student.isFundedAccount ? "default" : "secondary"}
//                   >
//                     {student.isFundedAccount ? "Funded" : "Regular"}
//                   </Badge>
//                 </div>
//                 {student.salesperson && (
//                   <div className="flex justify-between">
//                     <span className="text-muted-foreground">Salesperson:</span>
//                     <span>{student.salesperson}</span>
//                   </div>
//                 )}
//                 {student.referralInfo && (
//                   <div className="flex justify-between">
//                     <span className="text-muted-foreground">Referral:</span>
//                     <span>{student.referralInfo}</span>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </TabsContent>

//       <TabsContent value="payments" className="space-y-4">
//         <div className="space-y-2">
//           <h4 className="font-medium flex items-center gap-2">
//             <CreditCard className="h-4 w-4" />
//             Payment History
//           </h4>
//           <div className="space-y-2">
//             {mockPayments.slice(0, 3).map((payment) => (
//               <div
//                 key={payment.id}
//                 className="border rounded-lg p-3 flex justify-between items-center"
//               >
//                 <div>
//                   <p className="font-medium">
//                     ₹{payment.amount.toLocaleString()}
//                   </p>
//                   <p className="text-sm text-muted-foreground">
//                     {payment.date.toLocaleDateString()}
//                   </p>
//                 </div>
//                 <div className="text-right">
//                   <Badge variant="outline">{payment.mode}</Badge>
//                   <p className="text-sm text-muted-foreground">
//                     {payment.transactionId}
//                   </p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </TabsContent>

//       <TabsContent value="history" className="space-y-4">
//         <div className="space-y-2">
//           <h4 className="font-medium flex items-center gap-2">
//             <History className="h-4 w-4" />
//             Activity History
//           </h4>
//           <div className="space-y-2">
//             <div className="border rounded-lg p-3">
//               <p className="text-sm">Enrolled in {student.currentBatch.name}</p>
//               <p className="text-xs text-muted-foreground">
//                 {student.currentBatch.createdAt.toLocaleDateString()}
//               </p>
//             </div>
//             <div className="border rounded-lg p-3">
//               <p className="text-sm">Account created</p>
//               <p className="text-xs text-muted-foreground">
//                 Initial admission completed
//               </p>
//             </div>
//           </div>
//         </div>
//       </TabsContent>
//     </Tabs>
//   );
// }
