import { create } from "zustand";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
} from "reactflow";
import type { PerkData, Requirement } from "./types";
import { PERK_TYPES } from "./constants";

export type PerkNode = Node<PerkData>;

type Store = {
  nodes: PerkNode[];
  edges: Edge[];
  selectedNodeId: string | null;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  selectNode: (id: string | null) => void;
  addPerk: (typeKey: string, position: { x: number; y: number }) => void;
  duplicatePerk: (id: string, position?: { x: number; y: number }) => void;
  updatePerk: (id: string, patch: Partial<PerkData>) => void;
  deletePerk: (id: string) => void;
  loadState: (nodes: PerkNode[], edges: Edge[]) => void;
};

let counter = 0;
export const genId = (prefix: string) =>
  `${prefix}_${Date.now().toString(36)}_${(counter++).toString(36)}`;

const defaultDataForType = (typeKey: string): PerkData => {
  const def = PERK_TYPES.find((t) => t.key === typeKey) ?? PERK_TYPES[0];
  const isRoot = def.group === "root";
  const registrySuffix = def.field.toLowerCase();
  const requirements: Requirement[] = [];
  let constellation: PerkData["constellation"];
  if (isRoot && "constellation" in def) {
    constellation = def.constellation;
    requirements.push({
      id: genId("req"),
      type: "astralsorcery:constellation",
      constellation: def.constellation,
    });
  }
  return {
    registry_name: `astralsorcery:${registrySuffix}_${genId("p").slice(-4)}`,
    type: def.key,
    name_key: `perk.astralsorcery.${registrySuffix}`,
    category: isRoot ? "root" : def.group === "key" ? "major" : "default",
    modifiers: [],
    requirements,
    constellation,
  };
};

export const useStore = create<Store>((set) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  onNodesChange: (changes) =>
    set((state) => ({ nodes: applyNodeChanges(changes, state.nodes) as PerkNode[] })),
  onEdgesChange: (changes) =>
    set((state) => ({ edges: applyEdgeChanges(changes, state.edges) })),
  onConnect: (connection) =>
    set((state) => {
      if (!connection.source || !connection.target || connection.source === connection.target) {
        return state;
      }
      const exists = state.edges.some(
        (e) =>
          (e.source === connection.source && e.target === connection.target) ||
          (e.source === connection.target && e.target === connection.source)
      );
      if (exists) return state;
      return { edges: addEdge({ ...connection, type: "straight" }, state.edges) };
    }),
  selectNode: (id) => set({ selectedNodeId: id }),
  addPerk: (typeKey, position) => {
    const id = genId("perk");
    const data = defaultDataForType(typeKey);
    set((state) => ({
      nodes: [...state.nodes, { id, type: "perk", position, data }],
      selectedNodeId: id,
    }));
  },
  duplicatePerk: (sourceId, position) => {
    set((state) => {
      const source = state.nodes.find((n) => n.id === sourceId);
      if (!source) return state;
      const id = genId("perk");
      const suffix = genId("p").slice(-4);
      const base = source.data.registry_name.replace(/_[a-z0-9]{4}$/i, "");
      const registry_name = `${base}_${suffix}`;
      const data: PerkData = {
        ...source.data,
        registry_name,
        modifiers: source.data.modifiers.map((m) => ({ ...m, id: genId("mod") })),
        requirements: source.data.requirements.map((r) => ({ ...r, id: genId("req") })),
      };
      const pos = position ?? { x: source.position.x + 60, y: source.position.y + 60 };
      return {
        nodes: [...state.nodes, { id, type: "perk", position: pos, data }],
        selectedNodeId: id,
      };
    });
  },
  updatePerk: (id, patch) =>
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...patch } } : n
      ),
    })),
  deletePerk: (id) =>
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== id),
      edges: state.edges.filter((e) => e.source !== id && e.target !== id),
      selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
    })),
  loadState: (nodes, edges) => set({ nodes, edges, selectedNodeId: null }),
}));
