"use client";
import DarkVeil from "@/components/DarkVeil";
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
      <Card className="hover:shadow-lg transition-shadow duration-200 bg-gray-100/10 backdrop-blur-2xl border-0 text-white h-full min-h-[150px]">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="bg-[#0f1d40] p-2 rounded-md">
              <Icon className="h-6 w-6 text-gray-50" />
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
      <div className="relative rounded-2xl overflow-hidden">
        {/* Darkveil background */}
        <div className="absolute inset-0 z-0 h-[300px] w-full">
          <DarkVeil />
        </div>
        {/* Header content */}
        <div className="relative z-10 flex justify-between max-sm:flex-col max-sm:items-start max-sm:gap-2 items-center p-5 text-white">
          <div>
            <h1 className="text-3xl font-semibold text-white">
              System Settings
            </h1>
            <p className="text-sm text-gray-300">
              Configure system settings and preferences
            </p>
          </div>
        </div>
      </div>
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <SettingsCard
          path="/settings/courses"
          icon={GraduationCap}
          title="Course Configuration"
          description="Add new courses, modify structures, and configure course-specific settings and requirements."
        />
        <SettingsCard
          path="/settings/locations"
          icon={MapPin}
          title="Location Management"
          description="Manage multiple branches and configure location-specific settings."
        />
      </div>
    </div>
  );
}
