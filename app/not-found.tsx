import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen justify-center text-white bg-black items-center">
      <h2 className="text-4xl font-bold">Not Found</h2>
      <p className="text-lg text-gray-600">Could not find requested resource</p>
      <Link href="/" className="text-blue-500 hover:text-blue-700">
        Return Home
      </Link>
    </div>
  );
}
