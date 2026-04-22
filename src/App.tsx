import { useCallback, useMemo } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  type NodeTypes,
} from "reactflow";
import "reactflow/dist/style.css";
import { useStore } from "./store";
import { PerkNode } from "./components/PerkNode";
import { Palette } from "./components/Palette";
import { Inspector } from "./components/Inspector";
import { Toolbar } from "./components/Toolbar";
import "./App.css";

const App = () => {
  const nodes = useStore((s) => s.nodes);
  const edges = useStore((s) => s.edges);
  const onNodesChange = useStore((s) => s.onNodesChange);
  const onEdgesChange = useStore((s) => s.onEdgesChange);
  const onConnect = useStore((s) => s.onConnect);
  const selectNode = useStore((s) => s.selectNode);

  const nodeTypes: NodeTypes = useMemo(() => ({ perk: PerkNode }), []);

  const handleSelect = useCallback(
    (_: unknown, node: { id: string }) => selectNode(node.id),
    [selectNode]
  );
  const handlePaneClick = useCallback(() => selectNode(null), [selectNode]);

  return (
    <div className="app">
      <Toolbar />
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
            onPaneClick={handlePaneClick}
            connectionLineStyle={{ stroke: "#8ab4ff" }}
            defaultEdgeOptions={{ type: "straight", style: { stroke: "#8ab4ff", strokeWidth: 1.5 } }}
            fitView
          >
            <Background variant={BackgroundVariant.Dots} gap={28} size={1} color="#2c3450" />
            <MiniMap pannable zoomable maskColor="rgba(10,14,24,0.8)" nodeColor="#7aa6da" />
            <Controls />
          </ReactFlow>
        </div>
        <Inspector />
      </div>
    </div>
  );
};

export default App;
