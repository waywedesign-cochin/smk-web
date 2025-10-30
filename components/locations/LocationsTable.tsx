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
import { Location } from "@/lib/types";
import DeleteDialogue from "../shared/DashboardSidebar/DeleteDialogue";
import { useAppSelector } from "@/lib/hooks";

export default function LocationsTable({
  locations,
  handleEdit,
  handleDelete,
}: {
  locations: Location[];
  handleEdit: (location: Location) => void;
  handleDelete: (locationId: string) => void;
}) {
  const { currentUser } = useAppSelector((state) => state.users);
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
  return (
    <div className="w-full overflow-auto border border-gray-200 rounded-lg shadow dark:border-gray-800">
      <Table>
        <TableHeader>
          <TableRow className="bg-white hover:bg-white ">
            <TableHead>Name</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Created Date</TableHead>
            {(currentUser?.role === 1 || currentUser?.role === 3) && (
              <TableHead>Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {locations.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-center text-muted-foreground py-8"
              >
                No locations found. Add your first location to get started.
              </TableCell>
            </TableRow>
          ) : (
            locations.map((location) => (
              <TableRow key={location.id} className="hover:bg-transparent">
                <TableCell>
                  <div className="font-medium">{location.name}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {location.address || (
                      <span className="text-muted-foreground italic">
                        No address provided
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(location?.createdAt || "")}
                  </div>
                </TableCell>
                  {(currentUser?.role === 1 || currentUser?.role === 3) && (
                <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(location)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <DeleteDialogue
                        id={location?.id as string}
                        title={location.name}
                        handelDelete={handleDelete}
                      />
                    </div>
                </TableCell>
                  )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
