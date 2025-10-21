"use client";

import React, { use, useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Trash, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchUsers } from "@/redux/features/user/userSlice";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User } from "@/lib/types";

const UsersTable = () => {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const dispatch = useAppDispatch();
  const { users, loading } = useAppSelector((state) => state.users);

  const [debouncedSearch, setDebouncedSearch] = useState(search);

  // Debounce input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch users only when debounced search or role changes
  useEffect(() => {
    if (users && users.length === 0) {
      dispatch(fetchUsers());
    }
  }, []);

  const handleEdit = (user: User) => {
    console.log("Edit user:", user);
  };

  const handleDelete = (user: User) => {
    console.log("Delete user:", user);
  };

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
          <Input
            placeholder="Search by name, email, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 w-full backdrop-blur-sm bg-white/10 border border-white/20 text-white placeholder-white/50"
          />
        </div>

        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[160px] backdrop-blur-sm bg-white/10 border border-white/20 text-white">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent className="backdrop-blur-md bg-black/70 border border-white/20 text-white">
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="1">Admin</SelectItem>
            <SelectItem value="2">Director</SelectItem>
            <SelectItem value="3">Staff</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg backdrop-blur-md bg-black/30 border border-white/20 shadow-lg">
        <Table className="min-w-full divide-y divide-gray-200/10 bg-black/10">
          <TableHeader className="bg-black/20">
            <TableRow>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                Name
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                Email
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                Role
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-200/10 bg-black/10 border-0">
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-6 text-gray-400"
                >
                  Loading users...
                </TableCell>
              </TableRow>
            ) : users.length > 0 ? (
              users.map((user: User, idx: number) => (
                <TableRow
                  key={user.id}
                  className={`transition-all border-0 ${
                    idx % 2 === 0 ? "bg-black/10" : "bg-black/20"
                  }`}
                >
                  <TableCell className="px-6 py-4 whitespace-nowrap text-white font-medium hover:bg-white/5 transition-colors">
                    {user.username
                      ?.split(" ")
                      .map(
                        (word: string) =>
                          word.charAt(0).toUpperCase() +
                          word.slice(1).toLowerCase()
                      )
                      .join(" ")}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-gray-300 text-sm hover:bg-white/5 transition-colors">
                    {user.email}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap hover:bg-white/5 transition-colors">
                    <Badge variant="secondary">
                      {{
                        1: "Admin",
                        2: "Director",
                        3: "Staff",
                      }[user.role as 1 | 2 | 3] || "User"}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap flex gap-2 hover:bg-white/5 transition-colors">
                    <Button
                      variant="outline"
                      size="sm"
                      className="backdrop-blur-sm bg-white/10 text-white border-white/20 hover:bg-white/20"
                      onClick={() => handleEdit(user)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="bg-red-600 text-white hover:bg-red-700"
                      onClick={() => handleDelete(user)}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-6 text-gray-400"
                >
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default UsersTable;
