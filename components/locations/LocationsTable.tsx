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
    <div className="rounded-xl overflow-hidden border border-white/10 bg-black/30 shadow-lg">
      <Table className="min-w-full divide-y divide-gray-200/10">
        <TableHeader className="bg-gray-50/10 hover:bg-[#141617]">
          <TableRow className="bg-black border-none">
            <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
              Name
            </TableHead>
            <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
              Address
            </TableHead>
            <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
              Created Date
            </TableHead>
            {(currentUser?.role === 1 || currentUser?.role === 3) && (
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                Actions
              </TableHead>
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
            locations.map((location, idx) => (
              <TableRow
                key={location.id}
                className={`${
                  idx % 2 === 0
                    ? "bg-black/10 hover:bg-black/20"
                    : "bg-indigo-50/10 hover:bg-indigo-50/20"
                } transition-colors rounded-lg border-0`}
              >
                <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                  <div className="font-medium">{location.name}</div>
                </TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                  <div className="text-sm">
                    {location.address || (
                      <span className="text-white italic">
                        No address provided
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                  <div className="text-sm text-white">
                    {formatDate(location?.createdAt || "")}
                  </div>
                </TableCell>
                {(currentUser?.role === 1 || currentUser?.role === 3) && (
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-white/10 text-black hover:bg-white/80"
                        onClick={() => handleEdit(location)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {location.batches?.length === 0 &&
                        location.users?.length === 0 &&
                        location.cashbook?.length === 0 &&
                        location.DirectorLedger?.length === 0 && (
                          <DeleteDialogue
                            id={location?.id as string}
                            title={location.name}
                            handelDelete={handleDelete}
                          />
                        )}
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
