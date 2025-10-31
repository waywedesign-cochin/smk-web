import ResetPassword from "@/components/Auth/ResetPassword";
import React, { Suspense } from "react";

const page = () => {
  return (
    <Suspense fallback={<div className="text-center p-10">Loading...</div>}>
      <ResetPassword />
    </Suspense>
  );
};

export default page;
