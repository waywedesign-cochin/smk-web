import { IndianRupee } from "lucide-react";
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
import { CashbookEntry } from "@/redux/features/cashbook/cashbookSlice";

export default function TransactionTable({
  entries,
  title,
  description,
  emptyMessage,
  colorClass,
  loading,
}: {
  entries: CashbookEntry[];
  title: string;
  description: string;
  emptyMessage: string;
  colorClass?: string;
  loading?: boolean;
}) {
  const total = entries.reduce((sum, e) => sum + e.amount, 0);

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
                  <TableHead className="text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                    Description
                  </TableHead>
                  <TableHead className="text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                    Reference
                  </TableHead>
                  <TableHead className="text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                    Type
                  </TableHead>
                  <TableHead className="text-right">Amount</TableHead>
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
                      <TableCell>{entry.studentId}</TableCell>
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
