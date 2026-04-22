import type { Edge } from "reactflow";
import { PERK_TYPES, PERK_CATEGORIES, CONSTELLATIONS, ATTRIBUTE_TYPES, MODIFIER_MODES } from "./constants";
import type { PerkNode } from "./store";

const SCALE = 0.01;

const snap = (n: number) => Math.round(n * SCALE * 100) / 100;

const stripNs = (id: string) => id.replace(/^astralsorcery:/, "");

const categoryJson = (category: string) => {
  const def = PERK_CATEGORIES.find((c) => c.name === category) ?? PERK_CATEGORIES[0];
  return {
    color: def.color,
    name: { translate: `perk.category.astralsorcery.${def.name}` },
  };
};

const connectionsFor = (nodeId: string, nodes: PerkNode[], edges: Edge[]) => {
  const byId = new Map(nodes.map((n) => [n.id, n.data.registry_name]));
  return edges
    .filter((e) => e.source === nodeId || e.target === nodeId)
    .map((e) => (e.source === nodeId ? byId.get(e.target) : byId.get(e.source)))
    .filter((v): v is string => !!v)
    .sort();
};

export type PerkFile = { filename: string; content: string };

export const exportJson = (nodes: PerkNode[], edges: Edge[]): PerkFile[] => {
  return nodes.map((node) => {
    const { data } = node;
    const perk: Record<string, unknown> = {
      type: data.type,
      registry_name: data.registry_name,
      name: data.name_key,
      x: snap(node.position.x),
      y: snap(node.position.y),
      category: categoryJson(data.category),
    };
    if (data.constellation) perk.constellation = data.constellation;
    if (data.modifiers.length) {
      perk.modifiers = data.modifiers.map((m) => ({
        attribute_type: m.attribute_type,
        mode: m.mode,
        value: m.value,
      }));
    }
    if (data.requirements.length) {
      perk.requirements = data.requirements.map((r) => {
        if (r.type === "astralsorcery:constellation") {
          return { type: r.type, constellation: r.constellation };
        }
        return { type: r.type, progress: r.progress };
      });
    }
    const out = { perk, connections: connectionsFor(node.id, nodes, edges) };
    const id = stripNs(data.registry_name);
    return {
      filename: `data/astralsorcery/perks/${id}.json`,
      content: JSON.stringify(out, null, 2),
    };
  });
};

const typeField = (typeKey: string) =>
  PERK_TYPES.find((t) => t.key === typeKey)?.field ?? "MODIFIER_PERK";

const constellationField = (key: string) =>
  CONSTELLATIONS.find((c) => c.key === key)?.field ?? "AEVITAS";

const attributeField = (key: string) =>
  ATTRIBUTE_TYPES.find((a) => a.key === key)?.field ?? "MAX_HEALTH";

const modeField = (mode: number) =>
  MODIFIER_MODES.find((m) => m.mode === mode)?.field ?? "ADDITION";

const javaVar = (registry: string) => {
  const id = stripNs(registry).replace(/[^a-zA-Z0-9]/g, "_");
  return id.replace(/_(.)/g, (_, c) => c.toUpperCase()).replace(/^./, (c) => c.toLowerCase());
};

export const exportJava = (nodes: PerkNode[], edges: Edge[]): string => {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const varNames = new Map<string, string>();
  for (const n of nodes) varNames.set(n.id, javaVar(n.data.registry_name));

  const ordered = [...nodes].sort((a, b) => {
    const ar = PERK_TYPES.find((t) => t.key === a.data.type)?.group === "root" ? 0 : 1;
    const br = PERK_TYPES.find((t) => t.key === b.data.type)?.group === "root" ? 0 : 1;
    return ar - br;
  });

  const emittedEdges = new Set<string>();
  const lines: string[] = [];
  for (const node of ordered) {
    const d = node.data;
    const id = stripNs(d.registry_name);
    const varName = varNames.get(node.id)!;
    const xs = snap(node.position.x);
    const ys = snap(node.position.y);
    const chunks: string[] = [];
    chunks.push(`        var ${varName} = PerkDataBuilder.builder(PerkTypesAS.${typeField(d.type)})`);
    chunks.push(`                .create(AstralSorcery.key("${id}"), ${xs}f, ${ys}f)`);
    for (const req of d.requirements) {
      if (req.type === "astralsorcery:constellation") {
        chunks.push(`                .addRequirement(PerkRequirementConstellation.of(ConstellationsAS.${constellationField(req.constellation)}))`);
      } else {
        chunks.push(`                .addRequirement(PerkRequirementProgress.of("${req.progress}"))`);
      }
    }
    for (const m of d.modifiers) {
      chunks.push(`                .addModifier(${m.value}f, ModifierType.${modeField(m.mode)}, PerksAS.AttributeTypes.${attributeField(m.attribute_type)})`);
    }
    const neighbors = edges
      .filter((e) => e.source === node.id || e.target === node.id)
      .map((e) => (e.source === node.id ? e.target : e.source))
      .filter((nid) => {
        if (!byId.has(nid)) return false;
        const k = [node.id, nid].sort().join("->");
        if (emittedEdges.has(k)) return false;
        if (!varNames.has(nid)) return false;
        const idxSelf = ordered.findIndex((o) => o.id === node.id);
        const idxOther = ordered.findIndex((o) => o.id === nid);
        if (idxOther > idxSelf) return false;
        emittedEdges.add(k);
        return true;
      });
    for (const nid of neighbors) {
      chunks.push(`                .connect(${varNames.get(nid)})`);
    }
    chunks.push(`                .build(registrar);`);
    lines.push(chunks.join("\n"));
    lines.push("");
  }

  return [
    "// Paste inside AstralPerkTreeProvider.registerPerks(Registrar registrar)",
    "",
    ...lines,
  ].join("\n");
};

export const exportLang = (nodes: PerkNode[]): string => {
  const entries: [string, string][] = [];
  for (const n of nodes) {
    const base = n.data.name_key;
    const name = n.data.display_name?.trim();
    const desc = n.data.description?.trim();
    if (name) entries.push([`${base}.name`, name]);
    if (desc) entries.push([`${base}.description`, desc]);
  }
  entries.sort(([a], [b]) => a.localeCompare(b));
  const obj: Record<string, string> = {};
  for (const [k, v] of entries) obj[k] = v;
  return JSON.stringify(obj, null, 2);
};

export const exportProject = (nodes: PerkNode[], edges: Edge[]) => ({
  version: 1,
  nodes: nodes.map((n) => ({ id: n.id, position: n.position, data: n.data })),
  edges: edges.map((e) => ({ id: e.id, source: e.source, target: e.target })),
});

export type ProjectFile = ReturnType<typeof exportProject>;
