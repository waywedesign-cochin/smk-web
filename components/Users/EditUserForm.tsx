"use client";

import React, { useState } from "react";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Location, User } from "@/lib/types";

interface EditUserFormProps {
  user: User;
  onCancel: () => void;
  onSave: (updatedUser: User) => void;
  locations: Location[];
}

const roles = [
  { value: "1", label: "Admin" },
  { value: "2", label: "Director" },
  { value: "3", label: "Staff" },
  { value: "4", label: "Guest" },
];

const EditUserForm: React.FC<EditUserFormProps> = ({
  user,
  onCancel,
  onSave,
  locations,
}) => {
  const dispatch = useAppDispatch();
  const { usersLoading } = useAppSelector((state) => state.users);
  const [username, setUsername] = useState(user.username || "");
  const [email, setEmail] = useState(user.email || "");
  const [role, setRole] = useState(String(user.role));
  const [locationId, setLocationId] = useState(user.locationId || "");

  // Handler for Save button
  const handleSave = () => {
    const updatedUser: User = {
      ...user,
      username,
      email,
      role: Number(role),
      location: locations.find((l) => String(l.id) === locationId),
      locationId,
    };
    onSave(updatedUser);
  };

  return (
    <div className="p-4 bg-gray-800 rounded-md text-white space-y-4">
      <h3 className="text-2xl">Edit User Form</h3>
      <div>
        <label className="block mb-1">Username</label>
        <Input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          disabled={usersLoading}
        />
      </div>

      <div>
        <label className="block mb-1">Email</label>
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          type="email"
          disabled={usersLoading}
        />
      </div>

      <div>
        <label className="block mb-1">Role</label>
        <Select value={role} onValueChange={setRole} disabled={usersLoading}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            {roles.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block mb-1">Location</label>
        <Select
          value={locationId}
          onValueChange={setLocationId}
          disabled={usersLoading}
          required
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select location" />
          </SelectTrigger>
          <SelectContent>
            {locations
              .filter((l) => l.id !== undefined && l.id !== null)
              .map((l) => (
                <SelectItem key={l.id} value={l.id!.toString()}>
                  {l.name} - {l.address}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2 justify-end ">
        <Button variant="secondary" onClick={onCancel} disabled={usersLoading}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={usersLoading}>
          {usersLoading ? "Updating..." : "Update"}
        </Button>
      </div>
    </div>
  );
};

export default EditUserForm;
