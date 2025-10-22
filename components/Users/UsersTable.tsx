"use client";

import React, { useEffect, useState } from "react";
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
import { Edit, Search, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  deleteUser,
  fetchUsers,
  updateUser,
} from "@/redux/features/user/userSlice"; // Assumed updateUser action
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User } from "@/lib/types";
import EditUserForm from "./EditUserForm"; // Adjust path according to your file structure
import { fetchLocations } from "@/redux/features/location/locationSlice";
import DeleteDialogue from "../shared/DashboardSidebar/DeleteDialogue";

const UsersTable = () => {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("0");
  const dispatch = useAppDispatch();
  const { users, usersLoading } = useAppSelector((state) => state.users);
  const locations = useAppSelector((state) => state.locations.locations);

  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (users && users.length === 0) {
      dispatch(fetchUsers({}));
    }
    dispatch(fetchLocations());
  }, []);

  useEffect(() => {
    const payload: { search?: string; role?: number } = {};
    if (debouncedSearch) payload.search = debouncedSearch;
    if (roleFilter !== "0") payload.role = parseInt(roleFilter, 10);

    dispatch(fetchUsers(payload));
  }, [debouncedSearch, roleFilter]);

  const handleEdit = (user: User) => {
    setEditingUser(user);
  };
  const handleDelete = (id?: string) => {
    if (!id) return;
    dispatch(deleteUser(id));
  };

  // Handle cancelling edit
  const handleCancelEdit = () => {
    setEditingUser(null);
  };

  // Handle saving edited user
  const handleSaveEdit = async (updatedUser: User) => {
    await dispatch(updateUser(updatedUser)); // Dispatch update action to redux
    setEditingUser(null);
  };

  return (
    <div className="space-y-4">
      {/* Filter Bar and Table omitted for brevity, use your existing code */}

      {/* Conditionally render EditUserForm */}
      {editingUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 bg-opacity-60"
          onClick={handleCancelEdit}
        >
          <div
            className="bg-gray-900/50 p-1 rounded-md max-w-md w-full"
            onClick={(e) => e.stopPropagation()} // Prevent modal close on inside click
          >
            <EditUserForm
              user={editingUser}
              onCancel={handleCancelEdit}
              onSave={handleSaveEdit}
              locations={locations}
            />
          </div>
        </div>
      )}
      <>
        {/* Your existing Filter Bar and Users Table JSX here */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
            <Input
              placeholder="Search by name, email, or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-full  bg-white/10 border border-white/20 text-white placeholder-white/50"
            />
          </div>

          <Select
            value={roleFilter}
            onValueChange={(value) => setRoleFilter(value)}
          >
            <SelectTrigger className="w-[160px] backdrop-blur-sm bg-white/10 hover:bg-white/10 border border-white/20 text-white">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent className="backdrop-blur-md bg-black/70 border border-white/20 hover:bg-white/10 text-white">
              <SelectItem value="0">All Roles</SelectItem>
              <SelectItem value="1">Admin</SelectItem>
              <SelectItem value="2">Director</SelectItem>
              <SelectItem value="3">Staff</SelectItem>
              <SelectItem value="4">Guest</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto rounded-lg backdrop-blur-md bg-black/30 border border-white/20  shadow-lg">
          <Table className="min-w-full divide-y divide-gray-200/10 bg-black/10">
            <TableHeader className="bg-black/20 ">
              <TableRow>
                <TableHead className="text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                  Name
                </TableHead>
                <TableHead className=" text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                  Email
                </TableHead>
                <TableHead className=" text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                  Role
                </TableHead>
                <TableHead className=" text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                  Location
                </TableHead>
                <TableHead className="px-6 py-3  text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-200/10 bg-black/10 border-0">
              {usersLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-6 text-gray-500"
                  >
                    <div className="flex items-center justify-center gap-2 text-gray-500">
                      <Loader2 className="animate-spin h-5 w-5" />
                      Loading users...
                    </div>
                  </TableCell>
                </TableRow>
              ) : users?.length > 0 ? (
                users.map((user: User, idx: number) => (
                  <TableRow
                    key={user.id}
                    className={`transition-all hover:bg-white/10 border-0 ${
                      idx % 2 === 0 ? "bg-black/10" : "bg-black/20"
                    }`}
                  >
                    <TableCell>
                      {user.username
                        ?.split(" ")
                        .map(
                          (word: string) =>
                            word.charAt(0).toUpperCase() +
                            word.slice(1).toLowerCase()
                        )
                        .join(" ")}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {{
                          1: "Admin",
                          2: "Director",
                          3: "Staff",
                        }[user.role as 1 | 2 | 3] || "User"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm ">
                          {
                            locations.find(
                              (l) => String(l.id) === user?.locationId
                            )?.name
                          }
                        </div>
                      </div>
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
                      <DeleteDialogue
                        id={user.id as string}
                        title={user.username as string}
                        handelDelete={handleDelete}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-6 text-gray-500"
                  >
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </>
    </div>
  );
};

export default UsersTable;
