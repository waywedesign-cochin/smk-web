import React from "react";
import UsersTable from "@/components/Users/UsersTable";

const UsersPage = () => {
  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <div
        className="flex justify-between max-sm:flex-col max-sm:items-start max-sm:gap-2 items-center p-5 text-white rounded-2xl bg-cover bg-center"
        style={{
          backgroundImage: "url('/cource/course.png')",
          backgroundSize: "cover",

          backgroundPosition: "center",
        }}
      >
        {" "}
        <div>
          <h2 className="text-3xl max-md:text-2xl max-sm:text-xl font-semibold">
            Users Management
          </h2>
          <p className="text-white/80 max-md:text-sm max-sm:text-xs">
            Manage users and permissions
          </p>
        </div>
        <div className="flex gap-2"></div>
      </div>
      <div className="mt-6">
        <UsersTable />
      </div>
    </div>
  );
};

export default UsersPage;
