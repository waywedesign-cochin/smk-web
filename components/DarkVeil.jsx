import React from "react";

const DarkVeil = () => {
  return (
    <div className="absolute top-0 left-0 right-0 z-0 h-full bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 ">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_50%)]"></div>
    </div>
  );
};

export default DarkVeil;
