import React from "react";

export default function Toolbar({
  onZoomIn,
  onZoomOut,
  onFitView,
  onToggleTheme,
  theme,
  onExport,
}) {
  return (
    <div className="flex gap-2 items-center">
      <button className="px-2 py-1 border rounded text-white hover:bg-slate-700 transition-colors" onClick={onZoomIn}>
        Zoom In
      </button>
      <button className="px-2 py-1 border rounded text-white hover:bg-slate-700 transition-colors" onClick={onZoomOut}>
        Zoom Out
      </button>
      <button className="px-2 py-1 border rounded text-white hover:bg-slate-700 transition-colors" onClick={onFitView}>
        Fit View
      </button>
      <button className="px-2 py-1 border rounded text-white hover:bg-slate-700 transition-colors" onClick={onExport}>
        Export PNG
      </button>
      <button className="px-2 py-1 border rounded text-white hover:bg-slate-700 transition-colors" onClick={onToggleTheme}>
        {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
      </button>
    </div>
  );
}
