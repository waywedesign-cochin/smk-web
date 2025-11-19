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
import DarkVeil from "@/components/DarkVeil";

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
    <div className="space-y-6  bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-2 rounded-md">
      <div className="relative rounded-2xl overflow-hidden">
        {/* Darkveil background */}
        <div className="absolute inset-0 z-0 h-[300px] w-full">
          <DarkVeil />
        </div>
        {/* Header content */}
        <div className="relative z-10 flex justify-between max-sm:flex-col max-sm:items-start max-sm:gap-2 items-center p-5 text-white">
          <div>
            <h1 className="text-3xl font-semibold text-white">Locations</h1>
            <p className="text-sm text-gray-300">
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
      </div>
      <div className="bg-gradient-to-b from-black to-[#0A1533] p-2  flex flex-col gap-4 min-h-screen rounded-2xl">
        {/* Statistics Card */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card
            style={{
              backgroundImage: "url('/locations/1.png')",
              backgroundSize: "cover",
              border: "none",
            }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 text-white">
              <CardTitle className="text-sm font-medium  text-white">
                Total Locations
              </CardTitle>
              <MapPin className="h-4 w-4  text-white" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold  text-white">
                {locations.length}
              </div>
              <p className="text-xs  text-white">Active locations</p>
            </CardContent>
          </Card>

          <Card
            style={{
              backgroundImage: "url('/locations/2.png')",
              backgroundSize: "cover",
              border: "none",
            }}
          >
            <CardHeader className="flex flex-row items-center justify-between text-white space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Latest Location
              </CardTitle>
              <MapPin className="h-4 w-4 text-white" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {locations.length > 0
                  ? locations[locations.length - 1].name
                  : "None"}
              </div>
              <p className="text-xs text-white">Most recently added</p>
            </CardContent>
          </Card>

          <Card
            style={{
              backgroundImage: "url('/locations/3.png')",
              backgroundSize: "cover",
              border: "none",
            }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 text-white">
              <CardTitle className="text-sm font-medium">
                Locations with Address
              </CardTitle>
              <MapPin className="h-4 w-4 text-white" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-white font-bold">
                {locations.filter((l: Location) => l?.address?.trim()).length}
              </div>
              <p className="text-xs text-white">
                Out of {locations.length} total
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Locations Table */}
        <Card className="bg-white/10 border border-white/10 backdrop-blur-md text-white rounded-2xl overflow-hidden">
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
    </div>
  );
}
