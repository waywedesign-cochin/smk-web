"use client";
import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import LocationsTable from "@/components/locations/LocationsTable";
import AddLocation from "@/components/locations/AddLocation";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  addLocation,
  deleteLocation,
  fetchLocations,
  updateLocation,
} from "@/redux/features/location/locationSlice";
import { Location } from "@/lib/types";

export default function LocationsPage() {
  const dispatch = useAppDispatch();
  const locations = useAppSelector((state) => state.locations.locations);

  useEffect(() => {
    dispatch(fetchLocations());
  }, [dispatch]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);

  const handleSubmit = (data: Location, isEdit?: boolean) => {
    if (isEdit) {
      dispatch(updateLocation(data));
    } else {
      dispatch(addLocation(data));
    }
  };

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    setIsAddDialogOpen(true);
  };
  const handleDelete = (id?: string) => {
    if (!id) return;
    dispatch(deleteLocation(id));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl">Locations</h2>
          <p className="text-muted-foreground">
            Manage institute branches locations
          </p>
        </div>
        <AddLocation
          isAddDialogOpen={isAddDialogOpen}
          setIsAddDialogOpen={setIsAddDialogOpen}
          editingLocation={editingLocation}
          setEditingLocation={setEditingLocation}
          onSubmit={handleSubmit}
        />
      </div>

      {/* Statistics Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Locations
            </CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{locations.length}</div>
            <p className="text-xs text-muted-foreground">Active locations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Latest Location
            </CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {locations.length > 0
                ? locations[locations.length - 1].name
                : "None"}
            </div>
            <p className="text-xs text-muted-foreground">Most recently added</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Locations with Address
            </CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {locations.filter((l: Location) => l?.address?.trim()).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Out of {locations.length} total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Locations Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Locations</CardTitle>
        </CardHeader>
        <CardContent>
          <LocationsTable
            locations={locations}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
          />
        </CardContent>
      </Card>
    </div>
  );
}
