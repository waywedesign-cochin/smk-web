import React from "react";

const DarkVeil = () => {
  return (
    <div>
      <div className="absolute top-0 left-0 right-0 z-0 h-[200px] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {/* Subtle gradient orbs for depth */}
        <div className="absolute -top-20 right-0 w-80 h-80 bg-gradient-to-br from-emerald-500/15 to-teal-600/15 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 left-0 w-80 h-80 bg-gradient-to-tr from-blue-500/10 to-cyan-600/10 rounded-full blur-3xl"></div>

        {/* Financial grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: `linear-gradient(rgba(16, 185, 129, 0.3) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(16, 185, 129, 0.3) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        ></div>

        {/* Chart-like ascending lines */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" preserveAspectRatio="none">
            <path
              d="M 0,150 Q 100,120 200,130 T 400,110 T 600,90 T 800,100 T 1000,80 T 1200,70 T 1400,75 T 1600,65"
              stroke="rgba(16, 185, 129, 0.6)"
              strokeWidth="2"
              fill="none"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d="M 0,180 Q 100,160 200,170 T 400,150 T 600,140 T 800,145 T 1000,135 T 1200,125 T 1400,130 T 1600,120"
              stroke="rgba(59, 130, 246, 0.4)"
              strokeWidth="2"
              fill="none"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>

        {/* Candlestick pattern overlay */}
        <div className="absolute right-10 top-10 opacity-5">
          <div className="flex gap-2 items-end">
            <div className="w-1 h-16 bg-emerald-500"></div>
            <div className="w-1 h-12 bg-emerald-500"></div>
            <div className="w-1 h-20 bg-red-500"></div>
            <div className="w-1 h-14 bg-emerald-500"></div>
            <div className="w-1 h-18 bg-emerald-500"></div>
            <div className="w-1 h-10 bg-red-500"></div>
            <div className="w-1 h-16 bg-emerald-500"></div>
          </div>
        </div>

        {/* Subtle scanline effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent"></div>

        {/* Premium noise texture */}
        <div className="absolute inset-0 opacity-20 mix-blend-overlay bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii44IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIiB0eXBlPSJmcmFjdGFsTm9pc2UiLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjYSkiLz48L3N2Zz4=')]"></div>

        {/* Top border accent */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
      </div>
    </div>
  );
};

export default DarkVeil;
