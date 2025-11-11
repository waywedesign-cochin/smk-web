import { LoaderPinwheel } from "lucide-react";

export default function Loading() {
  // Or a custom loading skeleton component
  return (
    <div className="flex items-center justify-center h-screen w-full bg-black">
      <LoaderPinwheel className="w-12 h-12 animate-spin text-blue-500" />
    </div>
  );
}
