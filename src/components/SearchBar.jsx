import React, { useState } from "react";

export default function SearchBar({ onSearch }) {
  const [q, setQ] = useState("");
  return (
    <div className="flex gap-2 items-center">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyUp={(e) => {
          if (e.key === 'Enter') {
            onSearch(q);
          }
        }}
        placeholder="Search by path (e.g. $.users[0].name or $.address.city)"
        className="p-2 border rounded w-96 dark:bg-slate-800 dark:text-white"
      />
      <button
        className="px-3 py-1 bg-emerald-500 text-white rounded"
        onClick={() => onSearch(q)}
      >
        Search
      </button>
    </div>
  );
}
