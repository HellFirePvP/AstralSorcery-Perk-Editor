import type { PerkData, ModifierEntry, Requirement } from "./types";
import {
  ATTRIBUTE_TYPES,
  CONSTELLATIONS,
  MODIFIER_MODES,
  PERK_CATEGORIES,
  PERK_TYPES,
  type AttributeKey,
  type ConstellationKey,
  type ModifierMode,
  type PerkCategory,
  type PerkTypeKey,
} from "./constants";

export type ProjectNode = {
  id: string;
  position: { x: number; y: number };
  data: PerkData;
};

export type ProjectEdge = {
  id: string;
  source: string;
  target: string;
};

export type Project = {
  nodes: ProjectNode[];
  edges: ProjectEdge[];
};

class ParseError extends Error {}

const asObject = (v: unknown, path: string): Record<string, unknown> => {
  if (v === null || typeof v !== "object" || Array.isArray(v)) {
    throw new ParseError(`${path}: expected object`);
  }
  return v as Record<string, unknown>;
};

const asArray = (v: unknown, path: string): unknown[] => {
  if (!Array.isArray(v)) throw new ParseError(`${path}: expected array`);
  return v;
};

const asString = (v: unknown, path: string): string => {
  if (typeof v !== "string") throw new ParseError(`${path}: expected string`);
  return v;
};

const asFiniteNumber = (v: unknown, path: string): number => {
  if (typeof v !== "number" || !Number.isFinite(v)) {
    throw new ParseError(`${path}: expected finite number`);
  }
  return v;
};

const assertInSet = <T extends string>(
  value: string,
  allowed: readonly T[],
  path: string
): T => {
  if (!(allowed as readonly string[]).includes(value)) {
    throw new ParseError(`${path}: unknown value "${value}"`);
  }
  return value as T;
};

const PERK_TYPE_KEYS = PERK_TYPES.map((t) => t.key);
const ATTRIBUTE_KEYS = ATTRIBUTE_TYPES.map((a) => a.key);
const CATEGORY_NAMES = PERK_CATEGORIES.map((c) => c.name);
const CONSTELLATION_KEYS = CONSTELLATIONS.map((c) => c.key);
const MODIFIER_MODE_VALUES = MODIFIER_MODES.map((m) => m.mode);

const isProtoKey = (k: string) => k === "__proto__" || k === "constructor" || k === "prototype";

const guardKeys = (obj: Record<string, unknown>, path: string) => {
  for (const k of Object.keys(obj)) {
    if (isProtoKey(k)) throw new ParseError(`${path}: forbidden key "${k}"`);
  }
};

const parseModifier = (raw: unknown, path: string): ModifierEntry => {
  const o = asObject(raw, path);
  guardKeys(o, path);
  const mode = asFiniteNumber(o.mode, `${path}.mode`);
  if (!(MODIFIER_MODE_VALUES as readonly number[]).includes(mode)) {
    throw new ParseError(`${path}.mode: unknown mode ${mode}`);
  }
  return {
    id: asString(o.id, `${path}.id`),
    attribute_type: assertInSet(
      asString(o.attribute_type, `${path}.attribute_type`),
      ATTRIBUTE_KEYS,
      `${path}.attribute_type`
    ) as AttributeKey,
    mode: mode as ModifierMode,
    value: asFiniteNumber(o.value, `${path}.value`),
  };
};

const parseRequirement = (raw: unknown, path: string): Requirement => {
  const o = asObject(raw, path);
  guardKeys(o, path);
  const type = asString(o.type, `${path}.type`);
  const id = asString(o.id, `${path}.id`);
  if (type === "astralsorcery:constellation") {
    return {
      id,
      type,
      constellation: assertInSet(
        asString(o.constellation, `${path}.constellation`),
        CONSTELLATION_KEYS,
        `${path}.constellation`
      ) as ConstellationKey,
    };
  }
  if (type === "astralsorcery:progress") {
    return {
      id,
      type,
      progress: asString(o.progress, `${path}.progress`),
    };
  }
  throw new ParseError(`${path}.type: unknown requirement type "${type}"`);
};

const parsePerkData = (raw: unknown, path: string): PerkData => {
  const o = asObject(raw, path);
  guardKeys(o, path);
  const constellation = o.constellation === undefined || o.constellation === null
    ? undefined
    : (assertInSet(
        asString(o.constellation, `${path}.constellation`),
        CONSTELLATION_KEYS,
        `${path}.constellation`
      ) as ConstellationKey);
  return {
    registry_name: asString(o.registry_name, `${path}.registry_name`),
    type: assertInSet(
      asString(o.type, `${path}.type`),
      PERK_TYPE_KEYS,
      `${path}.type`
    ) as PerkTypeKey,
    name_key: asString(o.name_key, `${path}.name_key`),
    category: assertInSet(
      asString(o.category, `${path}.category`),
      CATEGORY_NAMES,
      `${path}.category`
    ) as PerkCategory,
    modifiers: asArray(o.modifiers, `${path}.modifiers`).map((m, i) =>
      parseModifier(m, `${path}.modifiers[${i}]`)
    ),
    requirements: asArray(o.requirements, `${path}.requirements`).map((r, i) =>
      parseRequirement(r, `${path}.requirements[${i}]`)
    ),
    constellation,
  };
};

const parseNode = (raw: unknown, path: string): ProjectNode => {
  const o = asObject(raw, path);
  guardKeys(o, path);
  const pos = asObject(o.position, `${path}.position`);
  guardKeys(pos, `${path}.position`);
  return {
    id: asString(o.id, `${path}.id`),
    position: {
      x: asFiniteNumber(pos.x, `${path}.position.x`),
      y: asFiniteNumber(pos.y, `${path}.position.y`),
    },
    data: parsePerkData(o.data, `${path}.data`),
  };
};

const parseEdge = (raw: unknown, path: string): ProjectEdge => {
  const o = asObject(raw, path);
  guardKeys(o, path);
  return {
    id: asString(o.id, `${path}.id`),
    source: asString(o.source, `${path}.source`),
    target: asString(o.target, `${path}.target`),
  };
};

const MAX_NODES = 10_000;
const MAX_EDGES = 50_000;

export const parseProject = (raw: unknown): Project => {
  const o = asObject(raw, "$");
  guardKeys(o, "$");
  const nodesRaw = asArray(o.nodes, "$.nodes");
  const edgesRaw = asArray(o.edges, "$.edges");
  if (nodesRaw.length > MAX_NODES) {
    throw new ParseError(`$.nodes: too many nodes (${nodesRaw.length} > ${MAX_NODES})`);
  }
  if (edgesRaw.length > MAX_EDGES) {
    throw new ParseError(`$.edges: too many edges (${edgesRaw.length} > ${MAX_EDGES})`);
  }
  const nodes = nodesRaw.map((n, i) => parseNode(n, `$.nodes[${i}]`));
  const nodeIds = new Set(nodes.map((n) => n.id));
  const edges = edgesRaw.map((e, i) => {
    const edge = parseEdge(e, `$.edges[${i}]`);
    if (!nodeIds.has(edge.source)) {
      throw new ParseError(`$.edges[${i}].source: unknown node id "${edge.source}"`);
    }
    if (!nodeIds.has(edge.target)) {
      throw new ParseError(`$.edges[${i}].target: unknown node id "${edge.target}"`);
    }
    return edge;
  });
  return { nodes, edges };
};
