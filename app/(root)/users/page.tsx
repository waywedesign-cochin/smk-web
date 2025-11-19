"use client";
import React from "react";
import UsersTable from "@/components/Users/UsersTable";
import DarkVeil from "@/components/DarkVeil";

const UsersPage = () => {
  return (
    <div className="min-h-screen  bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-2">
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
                User Management
              </h1>
              <p className="text-sm text-gray-300">
                Manage user and permissions
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 p-6 rounded-lg bg-blue-100/10">
        <UsersTable />
      </div>
    </div>
  );
};

export default UsersPage;
