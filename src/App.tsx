import { useCallback, useEffect, useMemo, useState } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  ConnectionMode,
  Controls,
  MiniMap,
  useStore as useRfStore,
  type NodeTypes,
} from "reactflow";
import "reactflow/dist/style.css";
import { useStore } from "./store";
import { PerkNode } from "./components/PerkNode";
import { Palette } from "./components/Palette";
import { Inspector } from "./components/Inspector";
import { Toolbar } from "./components/Toolbar";
import "./App.css";

// 1 exported unit = 100 canvas px (see SCALE in export.ts).
const GRID_MAJOR = 100;
const GRID_MINOR = 25;

const AxesOverlay = () => {
  const [tx, ty, zoom] = useRfStore((s) => s.transform);
  return (
    <svg
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 4,
      }}
    >
      <line x1={0} y1={ty} x2="100%" y2={ty} stroke="#e9d99a" strokeWidth={1} opacity={0.55} />
      <line x1={tx} y1={0} x2={tx} y2="100%" stroke="#e9d99a" strokeWidth={1} opacity={0.55} />
      <circle cx={tx} cy={ty} r={3 * Math.min(1, zoom)} fill="#e9d99a" opacity={0.9} />
    </svg>
  );
};

type NodeMenu = { id: string; x: number; y: number } | null;

const App = () => {
  const nodes = useStore((s) => s.nodes);
  const edges = useStore((s) => s.edges);
  const onNodesChange = useStore((s) => s.onNodesChange);
  const onEdgesChange = useStore((s) => s.onEdgesChange);
  const onConnect = useStore((s) => s.onConnect);
  const selectNode = useStore((s) => s.selectNode);
  const duplicatePerk = useStore((s) => s.duplicatePerk);
  const deletePerk = useStore((s) => s.deletePerk);

  const nodeTypes: NodeTypes = useMemo(() => ({ perk: PerkNode }), []);

  const [shiftHeld, setShiftHeld] = useState(false);
  const [nodeMenu, setNodeMenu] = useState<NodeMenu>(null);
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => { if (e.key === "Shift") setShiftHeld(true); };
    const onUp = (e: KeyboardEvent) => { if (e.key === "Shift") setShiftHeld(false); };
    const onBlur = () => setShiftHeld(false);
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  const handleSelect = useCallback(
    (_: unknown, node: { id: string }) => selectNode(node.id),
    [selectNode]
  );
  const handlePaneClick = useCallback(() => {
    selectNode(null);
    setNodeMenu(null);
  }, [selectNode]);
  const handleNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: { id: string }) => {
      event.preventDefault();
      selectNode(node.id);
      setNodeMenu({ id: node.id, x: event.clientX, y: event.clientY });
    },
    [selectNode]
  );

  return (
    <div className="app">
      <Toolbar snapOn={!shiftHeld} />
      <div className="body">
        <Palette />
        <div className="canvas">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={handleSelect}
            onNodeContextMenu={handleNodeContextMenu}
            onPaneClick={handlePaneClick}
            onMove={() => setNodeMenu(null)}
            connectionMode={ConnectionMode.Loose}
            snapToGrid={!shiftHeld}
            snapGrid={[GRID_MAJOR, GRID_MAJOR]}
            connectionLineStyle={{ stroke: "#8ab4ff" }}
            defaultEdgeOptions={{ type: "straight", style: { stroke: "#8ab4ff", strokeWidth: 1.5 } }}
            minZoom={0.05}
            maxZoom={3}
            fitView
          >
            <Background
              id="minor"
              variant={BackgroundVariant.Dots}
              gap={GRID_MINOR}
              size={0.6}
              color="#1a2038"
            />
            <Background
              id="major"
              variant={BackgroundVariant.Lines}
              gap={GRID_MAJOR}
              lineWidth={0.7}
              color="#2a3460"
            />
            <AxesOverlay />
            <MiniMap pannable zoomable maskColor="rgba(10,14,24,0.8)" nodeColor="#7aa6da" />
            <Controls />
          </ReactFlow>
        </div>
        <Inspector />
      </div>
      {nodeMenu && (
        <div
          className="context-menu"
          style={{ left: nodeMenu.x, top: nodeMenu.y }}
          onContextMenu={(e) => e.preventDefault()}
        >
          <button
            onClick={() => {
              duplicatePerk(nodeMenu.id);
              setNodeMenu(null);
            }}
          >
            Duplicate
          </button>
          <button
            className="danger"
            onClick={() => {
              deletePerk(nodeMenu.id);
              setNodeMenu(null);
            }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
