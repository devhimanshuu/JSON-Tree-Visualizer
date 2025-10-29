import React, { useCallback, useEffect, useRef, useState } from "react";
import { ReactFlow } from "@xyflow/react";
import { Background, Controls, MiniMap, useReactFlow } from "@xyflow/react";
import '@xyflow/react/dist/style.css';
import { buildTree } from "../utils/parser";
import { analyzeJSON } from "../utils/analytics";
import { toPng } from "html-to-image";

const TreeCanvas = React.forwardRef(({
  json,
  searchQuery,
  onNodeClickCopy,
  theme,
  onAnalyticsUpdate
}, ref) => {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  // Expose zoom methods via ref
  React.useImperativeHandle(ref, () => ({
    onZoomIn: () => zoomIn(),
    onZoomOut: () => zoomOut(),
    onFitView: () => fitView(),
    onExport: () => {
      if (reactFlowWrapper.current && rfInstance) {
        const { x, y, zoom } = rfInstance.getViewport();
        
        // Fit view to capture all nodes
        rfInstance.fitView({ duration: 0, padding: 0.2 });
        
        // Get the ReactFlow container (includes both nodes and edges)
        const flowElement = reactFlowWrapper.current.querySelector('.react-flow');
        if (!flowElement) return;

        // Get computed background color to match current theme
        const bgColor = theme === 'dark' ? '#0f172a' : '#ffffff';

        // Get the actual dimensions of the flow
        const rect = flowElement.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        // Apply current theme classes before export
        const wrapper = reactFlowWrapper.current;
        if (theme === 'dark') {
          wrapper.classList.add('dark');
        }

        // Hide controls and minimap temporarily
        const controls = flowElement.querySelector('.react-flow__controls');
        const minimap = flowElement.querySelector('.react-flow__minimap');
        if (controls) controls.style.display = 'none';
        if (minimap) minimap.style.display = 'none';

        toPng(flowElement, {
          backgroundColor: bgColor,
          quality: 1,
          width: width,
          height: height,
          style: {
            ...(theme === 'dark' && {
              filter: 'invert(0)',
              background: bgColor
            })
          }
        })
        .then((dataUrl) => {
          // Reset viewport and show controls/minimap
          rfInstance.setViewport({ x, y, zoom }, { duration: 0 });
          if (controls) controls.style.display = '';
          if (minimap) minimap.style.display = '';

          const a = document.createElement('a');
          a.setAttribute('download', `json-tree-${theme}.png`);
          a.setAttribute('href', dataUrl);
          a.click();

          if (theme === 'dark') {
            wrapper.classList.remove('dark');
          }
        })
        .catch((error) => {
          // Reset viewport and show controls/minimap
          rfInstance.setViewport({ x, y, zoom }, { duration: 0 });
          if (controls) controls.style.display = '';
          if (minimap) minimap.style.display = '';

          console.error('Error exporting image:', error);
          if (theme === 'dark') {
            wrapper.classList.remove('dark');
          }
        });
      }
    }
  }));
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [matchMsg, setMatchMsg] = useState("");
  const reactFlowWrapper = useRef(null);
  const [rfInstance, setRfInstance] = useState(null);

  useEffect(() => {
    if (!json) {
      setNodes([]);
      setEdges([]);
      return;
    }
    const { nodes: n, edges: e } = buildTree(json);
    // color nodes by type
    n.forEach((nd) => {
      const t = nd.data.label.startsWith("[")
        ? "array"
        : nd.data.label && nd.data.label.includes(":")
        ? "primitive"
        : nd.data.label === "$"
        ? typeof json === "object" && Array.isArray(json)
          ? "array"
          : "object"
        : nd.data.meta?.type || guessTypeFromLabel(nd.data.label);
      let cls = {};
      if (t === "object")
        cls = { background: "#7c3aed44", border: "1px solid #7c3aed" };
      else if (t === "array")
        cls = { background: "#16a34a44", border: "1px solid #16a34a" };
      else cls = { background: "#f59e0b44", border: "1px solid #f59e0b" };
      nd.style = { ...nd.style, ...cls };
    });
    setNodes(n);
    setEdges(e);
    setMatchMsg("");
  }, [json]);

  useEffect(() => {
    if (!searchQuery || !rfInstance) {
      setMatchMsg("");
      return;
    }
    // find node with path === searchQuery (allow $ prefix)
    const normalized = normalizePath(searchQuery);
    const found = nodes.find((n) => {
      const nodePath = normalizePath(n.data.path);
      return nodePath === normalized;
    });
    if (found) {
      setSelectedNode(found.id);
      setMatchMsg("Match found");
      
      // Update nodes without triggering re-render for each node
      const updatedNodes = nodes.map((x) => ({
        ...x,
        className: x.id === found.id ? "node-highlight" : "",
      }));
      setNodes(updatedNodes);

      // Center the view on the found node
      const { x, y } = found.position;
      rfInstance.setCenter(x + 80, y + 25, { duration: 400 });
    } else {
      setSelectedNode(null);
      setMatchMsg("No match found");
    }
  }, [searchQuery, rfInstance]); // Remove nodes from dependencies

  function normalizePath(p) {
    if (!p) return '';
    // Remove whitespace
    p = p.trim();
    // Ensure it starts with $
    if (!p.startsWith('$')) {
      p = '$' + (p.startsWith('.') ? '' : '.') + p;
    }
    return p;
  }

  function guessTypeFromLabel(label) {
    if (!label) return "primitive";
    if (label.startsWith("[")) return "array";
    if (label.includes(":")) return "primitive";
    return "object";
  }

  const handleNodeClick = useCallback(
    (evt, node) => {
      // copy path
      if (onNodeClickCopy) {
        navigator.clipboard.writeText(node.data.path).then(() => {
          onNodeClickCopy(node.data.path);
        });
      }
    },
    [onNodeClickCopy]
  );

  useEffect(() => {
    if (json) {
      onAnalyticsUpdate?.(analyzeJSON(json));
    } else {
      onAnalyticsUpdate?.(null);
    }
  }, [json, onAnalyticsUpdate]);

  return (
    <div className="h-full w-full relative" ref={reactFlowWrapper}>
      <ReactFlow
        ref={ref}
        nodes={nodes}
        edges={edges}
        onInit={setRfInstance}
        onNodeClick={handleNodeClick}
        fitView
        attributionPosition="bottom-left"
      >
        <Background />
        <Controls />
        <MiniMap 
          className="bg-white/90 dark:bg-slate-800/90 rounded-lg shadow-lg"
          style={{ width: 200, height: 160 }}
          nodeColor={(n) => {
            if (n.style?.background) return n.style.background;
            return '#1a192b';
          }}
          nodeStrokeWidth={3}
          maskColor="rgb(0, 0, 0, 0.2)"
          zoomable
          pannable
        />
      </ReactFlow>
      {matchMsg && (
        <div className="absolute bottom-2 left-2 bg-white dark:bg-slate-800 px-2 py-1 rounded shadow">
          {matchMsg}
        </div>
      )}
    </div>
  );
});

export default TreeCanvas;
