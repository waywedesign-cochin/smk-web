"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GraduationCap, MapPin } from "lucide-react";
import Link from "next/link";

// This is a reusable component for each setting card.
function SettingsCard({
  icon: Icon,
  title,
  description,
  path,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  path: string;
}) {
  return (
    <Link href={path}>
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="bg-gray-100 p-2 rounded-md">
              <Icon className="h-6 w-6 text-gray-500" />
            </div>
            <CardTitle>{title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription>{description}</CardDescription>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function SettingsPage() {
  return (
    <div className="">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-semibold">System Settings</h2>
          <p className="text-muted-foreground">
            Configure system settings and preferences
          </p>
        </div>
      </div>
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <SettingsCard
          path="/settings/courses"
          icon={GraduationCap}
          title="Course Configuration"
          description="Add new courses, modify fee structures, and configure course-specific settings and requirements."
        />
        <SettingsCard
          path="/settings/locations"
          icon={MapPin}
          title="Location Management"
          description="Manage multiple branches, assign coordinators, and configure location-specific settings."
        />
      </div>
    </div>
  );
}
