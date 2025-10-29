import { IndianRupee, Pencil } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import {
  CashbookEntry,
  deleteCashbookEntry,
} from "@/redux/features/cashbook/cashbookSlice";
import DeleteDialogue from "../shared/DashboardSidebar/DeleteDialogue";
import { Button } from "../ui/button";
import { useAppDispatch } from "@/lib/hooks";

export default function TransactionTable({
  entries,
  title,
  description,
  emptyMessage,
  colorClass,
  loading,
  handleEdit,
}: {
  entries: CashbookEntry[];
  title: string;
  description: string;
  emptyMessage: string;
  colorClass?: string;
  loading?: boolean;
  handleEdit: (entry: CashbookEntry) => void;
}) {
  const total = entries.reduce((sum, e) => sum + e.amount, 0);
  const dispatch = useAppDispatch();
  const handleDelete = (id?: string) => {
    if (!id) return;
    dispatch(deleteCashbookEntry(id));
  };

  return (
    <Card className="bg-[#0a0a0a]/70 backdrop-blur-3xl border-[#191a1a] text-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl">₹{total.toLocaleString()}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            <IndianRupee className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{emptyMessage}</p>
          </div>
        ) : loading ? (
          <>loading..</>
        ) : (
          <div className="overflow-x-auto rounded-lg backdrop-blur-md bg-black/30 border border-white/20  shadow-lg">
            <Table className="min-w-full divide-y divide-gray-200/10 bg-black/10">
              <TableHeader className="bg-black/20 ">
                <TableRow>
                  <TableHead className="text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                    Date
                  </TableHead>
                  {title === "Students Paid" && (
                    <TableHead className="text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                      Name
                    </TableHead>
                  )}
                  {title === "Students Paid" && (
                    <TableHead className="text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                      Batch
                    </TableHead>
                  )}
                  {title === "Owner Taken" && (
                    <TableHead className="text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                      Director
                    </TableHead>
                  )}
                  <TableHead className="text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                    Description
                  </TableHead>
                  <TableHead className="text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                    Reference
                  </TableHead>
                  <TableHead className="text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                    Type
                  </TableHead>
                  <TableHead className="text-right text-gray-50 ">
                    Amount
                  </TableHead>
                  <TableHead className="text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-200/10 bg-black/10 border-0">
                {entries.map((entry) => (
                  <TableRow
                    key={entry.id}
                    className={`transition-all ${colorClass} hover:bg-white/10 border-0 ${
                      entries.indexOf(entry) % 2 === 0
                        ? "bg-black/10"
                        : "bg-black/20"
                    }`}
                  >
                    <TableCell>
                      {new Date(entry.createdAt).toLocaleDateString("en-GB")}
                    </TableCell>
                    {title === "Students Paid" && (
                      <TableCell>
                        {/* {entry.name} */}
                        std name will come here
                      </TableCell>
                    )}
                    {title === "Students Paid" && (
                      <TableCell>
                        {/* {entry.batchname}  */}
                        std batch will come here
                      </TableCell>
                    )}
                    {title == "Owner Taken" && (
                      <TableCell>
                        {entry.directorId} this is id of director{" "}
                      </TableCell>
                    )}

                    <TableCell>{entry.description}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {entry.referenceId || "-"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          entry.debitCredit === "CREDIT"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {entry.debitCredit}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ₹{entry.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex max-sm:justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-gray-300  text-gray-700  hover:bg-blue-100  transition-colors duration-200"
                          onClick={() => handleEdit(entry)}
                        >
                          <Pencil className="w-4 h-4 mr-1" />
                        </Button>

                        <DeleteDialogue
                          id={entry.id as string}
                          title="this entry"
                          handelDelete={handleDelete}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-medium">
                  <TableCell colSpan={4} className="text-right">
                    Total
                  </TableCell>
                  <TableCell className="text-right">
                    ₹{total.toLocaleString()}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
