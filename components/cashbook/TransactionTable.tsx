"use client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CashbookEntry } from "@/redux/features/cashbook/cashbookSlice";
import { Edit, Loader2 } from "lucide-react";
import DeleteDialogue from "../shared/DashboardSidebar/DeleteDialogue";
import { useAppSelector } from "@/lib/hooks";

interface TransactionTableProps {
  entries: CashbookEntry[];
  title: string;
  emptyMessage: string;
  handleEdit: (entry: CashbookEntry) => void;
  onDelete: (id: string) => void;
  loading: boolean;
  colorClass?: string;
  description?: string;
}

const TransactionTable = ({
  entries,
  title,
  description,
  emptyMessage,
  colorClass = "bg-gray-50",
  onDelete,
  handleEdit,
  loading = false,
}: TransactionTableProps) => {
  const { currentUser } = useAppSelector((state) => state.users);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  if (loading && entries.length === 0) {
    return (
      <Card className={colorClass}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2">Loading entries...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/10 border border-white/10 backdrop-blur-md text-white rounded-2xl overflow-hidden">
      <CardHeader className="flex items-center gap-2 text-white">
        <CardTitle>{title}</CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          <div className="rounded-xl overflow-hidden border border-white/10 bg-black/30 shadow-lg">
            <Table className="min-w-full divide-y divide-gray-200/10">
              <TableHeader className="bg-gray-50/10 hover:bg-[#141617]">
                <TableRow className="bg-black border-none">
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                    Date
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                    Description
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                    Reference
                  </TableHead>
                  {title !== "Office Expenses" && (
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                      {/* Student/Director */}{" "}
                      {title === "Students Paid" ? "Student" : "Director"}
                    </TableHead>
                  )}
                  <TableHead className="text-right text-gray-50">
                    Amount
                  </TableHead>
                  {(currentUser?.role === 1 || currentUser?.role === 3) && (
                    <TableHead className="text-center text-gray-50">
                      Actions
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-6 text-gray-500"
                    >
                      <div className="flex items-center justify-center gap-2 text-gray-500">
                        <Loader2 className="animate-spin h-5 w-5" />
                        Loading entries...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  entries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">
                        {formatDate(entry.transactionDate)}
                      </TableCell>
                      <TableCell>{entry.description}</TableCell>
                      <TableCell>
                        {entry.referenceId || (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      {entry?.transactionType !== "OFFICE_EXPENSE" && (
                        <TableCell>
                          {entry.transactionType === "STUDENT_PAID" &&
                          entry.student ? (
                            <div>
                              <div className="font-medium">
                                {entry.student.name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {entry.student.currentBatch?.name || "No batch"}
                              </div>
                            </div>
                          ) : entry.transactionType === "OWNER_TAKEN" &&
                            entry.director ? (
                            <div>
                              <div className="font-medium">
                                {entry.director.username}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {entry.director.email}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      )}

                      <TableCell className="text-right font-medium">
                        {formatAmount(entry.amount)}
                      </TableCell>

                      {(currentUser?.role === 1 || currentUser?.role === 3) && (
                        <TableCell>
                          <div className="flex justify-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(entry)}
                              disabled={loading}
                              className="border-white/10 text-black hover:bg-white/80"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <DeleteDialogue
                              id={entry.id as string}
                              title={"this entry"}
                              handelDelete={() => onDelete(entry.id as string)}
                            />
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionTable;
