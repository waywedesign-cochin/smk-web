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
import { Edit, Trash2 } from "lucide-react";
import { Location } from "@/lib/types";

export default function LocationsTable({
  locations,
  handleEdit,
  handleDelete,
}: {
  locations: Location[];
  handleEdit: (location: Location) => void;
  handleDelete: (locationId: string) => void;
}) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Address</TableHead>
          <TableHead>Created Date</TableHead>
          <TableHead>Actions</TableHead>
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
            <TableRow key={location.id}>
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
                  {formatDate(location.createdAt)}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(location)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(location.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
