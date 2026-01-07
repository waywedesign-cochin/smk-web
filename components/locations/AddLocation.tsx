"use client";

import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  LocationFormData,
  locationSchema,
} from "@/lib/validation/locationSchema";
import { Location } from "@/lib/types";
import { useAppSelector } from "@/lib/hooks";

export default function AddLocation({
  isAddDialogOpen,
  setIsAddDialogOpen,
  editingLocation,
  setEditingLocation,
  onSubmit,
}: {
  isAddDialogOpen: boolean;
  setIsAddDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  editingLocation: Location | null;
  setEditingLocation: React.Dispatch<React.SetStateAction<Location | null>>;
  onSubmit: (location: Location, isEdit?: boolean) => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: { name: "", address: "" },
  });
  const { currentUser } = useAppSelector((state) => state.users);
  const { loading } = useAppSelector((state) => state.locations);
  // Reset when editing or adding new
  useEffect(() => {
    if (editingLocation) {
      reset({
        id: editingLocation.id,
        name: editingLocation.name,
        address: editingLocation.address || "",
      });
    } else {
      reset({ id: "", name: "", address: "" });
    }
  }, [editingLocation, reset]);

  const submitHandler = async (data: LocationFormData) => {
    await onSubmit(data, !!editingLocation);
    setIsAddDialogOpen(false);
    setEditingLocation(null);
    reset();
  };

  return (
    <div>
      {(currentUser?.role === 1 || currentUser?.role === 3) && (
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-black border border-white text-white hover:bg-white hover:text-black"
              onClick={() => {
                reset();
                setEditingLocation(null);
              }}
            >
              <Plus className="h-4 w-4 " />
              Add Location
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-md bg-[#0a0a0a]/70 backdrop-blur-3xl border-[#191a1a]">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingLocation ? "Edit Location" : "Add New Location"}
              </DialogTitle>
            </DialogHeader>

            <form
              onSubmit={handleSubmit(submitHandler)}
              className="space-y-4 text-white"
            >
              <div className="space-y-2">
                <Label htmlFor="name">Location Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter location name"
                  className="bg-[#151515] border-[#191a1a]"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  placeholder="Enter complete address (optional)"
                  rows={3}
                  className="bg-[#151515] border-[#191a1a]"
                  {...register("address")}
                />
                {errors.address && (
                  <p className="text-sm text-red-500">
                    {errors.address.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    setEditingLocation(null);
                    reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingLocation
                    ? loading
                      ? "Updating..."
                      : "Update Location"
                    : loading
                    ? "Adding..."
                    : "Add Location"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
