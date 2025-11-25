"use client";
import { useEffect, useState } from "react";
import { Banknote } from "lucide-react"; // Changed MapPin to Banknote
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import BankAccountsTable from "@/components/bank/BankAccountsTable"; // Changed component name
import AddEditBankAccount from "@/components/bank/AddEditBankAccount"; // Changed component name
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  addBankAccount,
  deleteBankAccount,
  fetchBankAccounts,
  updateBankAccount,
} from "@/redux/features/bank/bankSlice"; // Changed slice imports
import { BankAccount } from "@/lib/types"; // Used BankAccount type
import DarkVeil from "@/components/DarkVeil";

export default function BankAccountsPage() {
  const dispatch = useAppDispatch();
  const bankAccounts = useAppSelector((state) => state.bank.bankAccounts); // Changed state selector

  useEffect(() => {
    dispatch(fetchBankAccounts()); // Changed fetch thunk
  }, [dispatch]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(
    null
  ); // Changed state name

  const handleSubmit = (data: BankAccount, isEdit?: boolean) => {
    if (isEdit) {
      dispatch(updateBankAccount(data)); // Changed update thunk
    } else {
      // Need to omit 'id' for add operation if it's auto-generated
      const { id, ...newAccountData } = data;
      if (
        newAccountData.ifscCode === null ||
        newAccountData.ifscCode === undefined
      ) {
        // Handle the case where ifscCode is null or undefined
        // For example, you can set it to an empty string
        newAccountData.ifscCode = "";
      }
      dispatch(
        addBankAccount(
          newAccountData as Omit<BankAccount, "id"> & {
            ifscCode: string;
          }
        )
      );
    }
  };

  const handleEdit = (bankAccount: BankAccount) => {
    // Changed param name
    setEditingAccount(bankAccount); // Changed state name
    setIsAddDialogOpen(true);
  };
  const handleDelete = (id?: string) => {
    if (!id) return;
    dispatch(deleteBankAccount(id)); // Changed delete thunk
  };

  // Simple logic for the second card (e.g., Accounts with IFSC code)
  const accountsWithIfsc = bankAccounts.filter((acc: BankAccount) =>
    acc?.ifscCode?.trim()
  ).length;

  return (
    <div className="space-y-6 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-2 rounded-md">
      <div className="relative rounded-2xl overflow-hidden">
        {/* Darkveil background */}
        <div className="absolute inset-0 z-0 h-[300px] w-full">
          <DarkVeil />
        </div>
        {/* Header content */}
        <div className="relative z-10 flex justify-between max-sm:flex-col max-sm:items-start max-sm:gap-2 items-center p-5 text-white">
          <div>
            <h1 className="text-3xl font-semibold text-white">Bank Accounts</h1>
            <p className="text-sm text-gray-300">
              Configure and Manage Bank Accounts
            </p>
          </div>

          <AddEditBankAccount // Changed component name
            isAddDialogOpen={isAddDialogOpen}
            setIsAddDialogOpen={setIsAddDialogOpen}
            editingAccount={editingAccount} // Changed prop name
            setEditingAccount={setEditingAccount} // Changed prop name
            onSubmit={handleSubmit}
          />
        </div>
      </div>
      <div className="bg-gradient-to-b from-black to-[#0A1533] p-2 flex flex-col gap-4 min-h-screen rounded-2xl">
        {/* Statistics Card */}

        <div className="grid grid-cols-1 md:grid-cols-2  gap-6">
          <Card
            style={{
              backgroundImage: "url('/locations/1.png')", // Placeholder image
              backgroundSize: "cover",
              border: "none",
            }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 text-white">
              <CardTitle className="text-sm font-medium text-white">
                Total Accounts
              </CardTitle>
              <Banknote className="h-4 w-4 text-white" /> {/* Changed icon */}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {bankAccounts.length}
              </div>
              <p className="text-xs text-white">
                Total bank accounts configured
              </p>
            </CardContent>
          </Card>

          <Card
            style={{
              backgroundImage: "url('/locations/3.png')", // Placeholder image
              backgroundSize: "cover",
              border: "none",
            }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 text-white">
              <CardTitle className="text-sm font-medium">
                IFSC Available
              </CardTitle>
              <Banknote className="h-4 w-4 text-white" /> {/* Changed icon */}
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-white font-bold">
                {accountsWithIfsc}
              </div>
              <p className="text-xs text-white">
                Accounts with IFSC code provided
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Bank Accounts Table */}
        <Card className="bg-white/10 border border-white/10 backdrop-blur-md text-white rounded-2xl overflow-hidden">
          <CardHeader>
            <CardTitle>All Bank Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <BankAccountsTable // Changed component name
              bankAccounts={bankAccounts} // Changed prop name
              handleEdit={handleEdit}
              handleDelete={handleDelete}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
