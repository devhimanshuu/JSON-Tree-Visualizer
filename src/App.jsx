import React, { useCallback, useRef, useState } from "react";
import Editor from "./components/Editor";
import TreeCanvas from "./components/TreeCanvas";
import SearchBar from "./components/SearchBar";
import Toolbar from "./components/ToolBar";
import { ReactFlowProvider } from '@xyflow/react';

export default function App() {
  const [json, setJson] = useState(null);
  const [searchQ, setSearchQ] = useState("");
  const [theme, setTheme] = useState("light");
  const [copyMsg, setCopyMsg] = useState("");
  const [analytics, setAnalytics] = useState(null);
  const treeCanvasRef = useRef(null);

  function handleVisualize(parsed) {
    setJson(parsed);
  }
  function handleClear() {
    setJson(null);
  }

  function handleSearch(q) {
    setSearchQ(q);
  }

  function handleCopy(path) {
    setCopyMsg(`Copied ${path}`);
    setTimeout(() => setCopyMsg(""), 2000);
  }

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "light" ? "dark" : "light"));
    document.documentElement.classList.toggle("dark");
  }, []);

  const handleExport = useCallback(() => {
    if (treeCanvasRef.current) {
      treeCanvasRef.current.onExport();
    }
  }, []);

  return (
    <div
      className={`app-bg ${
        theme === "dark" ? "dark" : "light"
      } h-screen flex overflow-hidden`}
    >
      <aside className="w-96 border-r flex flex-col bg-white dark:bg-slate-900">
        <h2 className="text-xl font-bold p-4 text-slate-900 dark:text-white">JSON Input</h2>
        <div className="flex-1 overflow-hidden">
          <Editor onVisualize={handleVisualize} onClear={handleClear} />
        </div>
        {json && analytics && (
          <div className="p-4 border-t bg-slate-50 dark:bg-slate-800/50">
            <h3 className="font-medium mb-2 text-sm text-white">JSON Analytics</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: "Total Keys", value: analytics.totalKeys },
                { label: "Max Depth", value: analytics.maxDepth },
                { label: "Total Arrays", value: analytics.totalArrays },
                { label: "Memory Size", value: analytics.memorySize }
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center bg-white dark:bg-slate-800 p-2 rounded shadow-sm text-white">
                  <span>{label}:</span>
                  <span className="font-mono font-bold">{value}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-[#7c3aed44] border border-[#7c3aed] "></div>
                  <span className="text-white">Objects</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-[#16a34a44] border border-[#16a34a] "></div>
                  <span className="text-white">Arrays</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-[#f59e0b44] border border-[#f59e0b] "></div>
                  <span className="text-white">Primitives</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>
      <main className="flex-1 flex flex-col">
        <header className="p-4 flex items-center justify-between border-b bg-white dark:bg-slate-800">
          <div className="flex items-center gap-4">
            <SearchBar onSearch={handleSearch} />
          </div>
          <div className="flex items-center gap-4">
            <Toolbar
              onZoomIn={() => treeCanvasRef.current?.onZoomIn()}
              onZoomOut={() => treeCanvasRef.current?.onZoomOut()}
              onFitView={() => treeCanvasRef.current?.onFitView()}
              onToggleTheme={toggleTheme}
              theme={theme}
              onExport={handleExport}
            />
          </div>
        </header>
        <div className="flex-1">
          <ReactFlowProvider>
          <TreeCanvas
            ref={treeCanvasRef}
            json={json}
            searchQuery={searchQ}
            onNodeClickCopy={handleCopy}
            theme={theme}
            onAnalyticsUpdate={setAnalytics}
          />
          </ReactFlowProvider>
        </div>
        <div className="p-2 text-sm">{copyMsg}</div>
      </main>
    </div>
  );
}
