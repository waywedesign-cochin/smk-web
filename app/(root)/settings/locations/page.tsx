"use client";
import { useState } from "react";

import { Plus, Edit, Trash2, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LocationsTable from "@/components/locations/LocationsTable";
import AddLocation from "@/components/locations/AddLocation";

interface Location {
  id: string;
  name: string;
  address: string;
  createdAt: string;
}

const mockLocations: Location[] = [
  {
    id: "1",
    name: "calicut",
    address: "mavoor road",
    createdAt: "2020-03-15T10:30:00Z",
  },
  {
    id: "2",
    name: "Kochi",
    address: "Edappaly near LuLu mall",
    createdAt: "2021-06-10T14:20:00Z",
  },
  {
    id: "3",
    name: "Trivandrum",
    address: "Near bus stand",
    createdAt: "2022-01-20T09:15:00Z",
  },
];

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>(mockLocations);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
    });
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      //   toast.error("Location name is required");
      return;
    }

    // Check for duplicate names (since it's unique in schema)
    const isDuplicate = locations.some(
      (location) =>
        location.name.toLowerCase() === formData.name.toLowerCase() &&
        location.id !== editingLocation?.id
    );

    if (isDuplicate) {
      //   toast.error("Location name already exists");
      return;
    }

    if (editingLocation) {
      setLocations(
        locations.map((location) =>
          location.id === editingLocation.id
            ? {
                ...location,
                name: formData.name.trim(),
                address: formData.address.trim(),
              }
            : location
        )
      );
      //   toast.success("Location updated successfully");
      setEditingLocation(null);
    } else {
      const newLocation: Location = {
        id: Date.now().toString(), // Simple ID generation for demo
        name: formData.name.trim(),
        address: formData.address.trim(),
        createdAt: new Date().toISOString(),
      };
      setLocations([...locations, newLocation]);
      //   toast.success("Location added successfully");
    }

    resetForm();
    setIsAddDialogOpen(false);
  };

  const handleEdit = (location: Location) => {
    setFormData({
      name: location.name,
      address: location.address,
    });
    setEditingLocation(location);
    setIsAddDialogOpen(true);
  };

  const handleDelete = (locationId: string) => {
    setLocations(locations.filter((location) => location.id !== locationId));
    // toast.success("Location deleted successfully");
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
          formData={formData}
          handleSubmit={handleSubmit}
          isAddDialogOpen={isAddDialogOpen}
          setIsAddDialogOpen={setIsAddDialogOpen}
          setFormData={setFormData}
          resetForm={resetForm}
          editingLocation={editingLocation}
          setEditingLocation={setEditingLocation}
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
              {locations.filter((l) => l.address.trim()).length}
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
