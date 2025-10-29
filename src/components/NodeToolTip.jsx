import React from "react";

export default function NodeTooltip({ node }) {
  if (!node) return null;
  return (
    <div className="p-2 text-xs bg-black text-white rounded">
      <div>
        <strong>Path:</strong> {node.data.path}
      </div>
      <div>
        <strong>Label:</strong> {node.data.label}
      </div>
    </div>
  );
}
