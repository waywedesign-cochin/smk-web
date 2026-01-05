import React from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { BankAccount } from "@/lib/types"; // Used BankAccount type
import DeleteDialogue from "../shared/DashboardSidebar/DeleteDialogue"; // Assuming path is correct
import { useAppSelector } from "@/lib/hooks";

export default function BankAccountsTable({
  // Changed component name
  bankAccounts, // Changed prop name
  handleEdit,
  handleDelete,
}: {
  bankAccounts: BankAccount[]; // Changed prop type
  handleEdit: (bankAccount: BankAccount) => void; // Changed function type
  handleDelete: (bankAccountId: string) => void; // Changed function type
}) {
  const { currentUser } = useAppSelector((state) => state.users);

  const formatDate = (dateString: string | undefined) => {
    // Added undefined check
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="rounded-xl overflow-hidden border border-white/10 bg-black/30 shadow-lg">
      <Table className="min-w-full divide-y divide-gray-200/10">
        <TableHeader className="bg-gray-50/10 hover:bg-[#141617]">
          <TableRow className="bg-black border-none">
            <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
              Account Name
            </TableHead>
            <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
              Bank Name
            </TableHead>
            <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
              Account Number
            </TableHead>
            <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
              IFSC Code / Branch
            </TableHead>
            <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
              Created Date
            </TableHead>
            {(currentUser?.role === 1 || currentUser?.role === 3) && (
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                Actions
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {bankAccounts.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6} // Increased colspan for new columns
                className="text-center text-muted-foreground py-8"
              >
                No bank accounts found. Add your first account to get started.
              </TableCell>
            </TableRow>
          ) : (
            bankAccounts.map(
              (
                account,
                idx // Changed variable name
              ) => (
                <TableRow
                  key={account.id}
                  className={`${
                    idx % 2 === 0
                      ? "bg-black/10 hover:bg-black/20"
                      : "bg-indigo-50/10 hover:bg-indigo-50/20"
                  } transition-colors rounded-lg border-0`}
                >
                  {/* Account Name */}
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                    <div className="font-medium">{account.accountName}</div>
                  </TableCell>
                  {/* Bank Name */}
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                    <div className="font-medium">{account.bankName}</div>
                  </TableCell>
                  {/* Account Number */}
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                    <div className="text-sm">{account.accountNumber}</div>
                  </TableCell>
                  {/* IFSC / Branch */}
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                    <div className="text-sm">
                      {account.ifscCode ||
                        account.branch || ( // Display IFSC or Branch
                          <span className="text-white italic">
                            Not provided
                          </span>
                        )}
                    </div>
                  </TableCell>
                  {/* Created Date */}
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                    <div className="text-sm text-white">
                      {formatDate(account.createdAt as string)}
                    </div>
                  </TableCell>
                  {(currentUser?.role === 1 || currentUser?.role === 3) && (
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-white/10 text-black hover:bg-white/80"
                          onClick={() => handleEdit(account)} // Changed object passed
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <DeleteDialogue
                          id={account.id as string}
                          title={account.accountName} // Use accountName for title
                          handelDelete={handleDelete}
                        />
                        {/* )} */}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              )
            )
          )}
        </TableBody>
      </Table>
    </div>
  );
}
