import { useStore, genId } from "../store";
import {
  ATTRIBUTE_TYPES,
  CONSTELLATIONS,
  MODIFIER_MODES,
  PERK_CATEGORIES,
  PERK_TYPES,
} from "../constants";
import type { ModifierEntry, Requirement } from "../types";

export const Inspector = () => {
  const selectedId = useStore((s) => s.selectedNodeId);
  const node = useStore((s) => s.nodes.find((n) => n.id === selectedId));
  const updatePerk = useStore((s) => s.updatePerk);
  const deletePerk = useStore((s) => s.deletePerk);

  if (!node) {
    return (
      <aside className="panel inspector">
        <h3>Inspector</h3>
        <p className="hint">Select a perk to edit its properties, or click a palette entry to add one.</p>
        <p className="hint">Drag from one node to another to create a link.</p>
      </aside>
    );
  }

  const { data } = node;

  const patchModifier = (idx: number, patch: Partial<ModifierEntry>) => {
    const modifiers = data.modifiers.map((m, i) => (i === idx ? { ...m, ...patch } : m));
    updatePerk(node.id, { modifiers });
  };

  const addModifier = () => {
    updatePerk(node.id, {
      modifiers: [
        ...data.modifiers,
        { id: genId("mod"), attribute_type: "astralsorcery:max_health", mode: 0, value: 1 },
      ],
    });
  };

  const removeModifier = (idx: number) => {
    updatePerk(node.id, { modifiers: data.modifiers.filter((_, i) => i !== idx) });
  };

  const patchRequirement = (idx: number, patch: Partial<Requirement>) => {
    const requirements = data.requirements.map((r, i) =>
      i === idx ? ({ ...r, ...patch } as Requirement) : r
    );
    updatePerk(node.id, { requirements });
  };

  const addRequirement = (kind: Requirement["type"]) => {
    const req: Requirement =
      kind === "astralsorcery:constellation"
        ? { id: genId("req"), type: kind, constellation: "astralsorcery:aevitas" }
        : { id: genId("req"), type: kind, progress: "" };
    updatePerk(node.id, { requirements: [...data.requirements, req] });
  };

  const removeRequirement = (idx: number) => {
    updatePerk(node.id, { requirements: data.requirements.filter((_, i) => i !== idx) });
  };

  return (
    <aside className="panel inspector">
      <div className="inspector-head">
        <h3>Perk</h3>
        <button className="danger" onClick={() => deletePerk(node.id)}>Delete</button>
      </div>

      <label>
        Type
        <select
          value={data.type}
          onChange={(e) => updatePerk(node.id, { type: e.target.value as typeof data.type })}
        >
          {PERK_TYPES.map((t) => (
            <option key={t.key} value={t.key}>
              {t.field}
            </option>
          ))}
        </select>
      </label>

      <label>
        Registry name
        <input
          value={data.registry_name}
          onChange={(e) => updatePerk(node.id, { registry_name: e.target.value })}
        />
      </label>

      <label>
        Name key
        <input
          value={data.name_key}
          onChange={(e) => updatePerk(node.id, { name_key: e.target.value })}
        />
      </label>

      <label>
        Category
        <select
          value={data.category}
          onChange={(e) => updatePerk(node.id, { category: e.target.value as typeof data.category })}
        >
          {PERK_CATEGORIES.map((c) => (
            <option key={c.name} value={c.name}>
              {c.label}
            </option>
          ))}
        </select>
      </label>

      <label>
        Constellation (root only)
        <select
          value={data.constellation ?? ""}
          onChange={(e) =>
            updatePerk(node.id, {
              constellation: (e.target.value || undefined) as typeof data.constellation,
            })
          }
        >
          <option value="">— none —</option>
          {CONSTELLATIONS.map((c) => (
            <option key={c.key} value={c.key}>
              {c.field}
            </option>
          ))}
        </select>
      </label>

      <div className="section">
        <div className="section-head">
          <h4>Modifiers</h4>
          <button onClick={addModifier}>+ add</button>
        </div>
        {data.modifiers.length === 0 && <p className="hint">No modifiers.</p>}
        {data.modifiers.map((m, i) => (
          <div key={m.id} className="row">
            <input
              type="number"
              step="any"
              value={m.value}
              onChange={(e) => patchModifier(i, { value: parseFloat(e.target.value) || 0 })}
              style={{ width: 70 }}
            />
            <select
              value={m.mode}
              onChange={(e) => patchModifier(i, { mode: Number(e.target.value) as typeof m.mode })}
            >
              {MODIFIER_MODES.map((mm) => (
                <option key={mm.mode} value={mm.mode}>
                  {mm.label}
                </option>
              ))}
            </select>
            <select
              value={m.attribute_type}
              onChange={(e) =>
                patchModifier(i, { attribute_type: e.target.value as typeof m.attribute_type })
              }
            >
              {ATTRIBUTE_TYPES.map((a) => (
                <option key={a.key} value={a.key}>
                  {a.field}
                </option>
              ))}
            </select>
            <button className="danger" onClick={() => removeModifier(i)}>×</button>
          </div>
        ))}
      </div>

      <div className="section">
        <div className="section-head">
          <h4>Requirements</h4>
          <div>
            <button onClick={() => addRequirement("astralsorcery:constellation")}>+ constellation</button>
            <button onClick={() => addRequirement("astralsorcery:progress")}>+ progress</button>
          </div>
        </div>
        {data.requirements.length === 0 && <p className="hint">No requirements.</p>}
        {data.requirements.map((r, i) => (
          <div key={r.id} className="row">
            <span className="tag">{r.type.replace("astralsorcery:", "")}</span>
            {r.type === "astralsorcery:constellation" ? (
              <select
                value={r.constellation}
                onChange={(e) =>
                  patchRequirement(i, { constellation: e.target.value as typeof r.constellation })
                }
              >
                {CONSTELLATIONS.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.field}
                  </option>
                ))}
              </select>
            ) : (
              <input
                value={r.progress}
                onChange={(e) => patchRequirement(i, { progress: e.target.value })}
                placeholder="progress key"
              />
            )}
            <button className="danger" onClick={() => removeRequirement(i)}>×</button>
          </div>
        ))}
      </div>
    </aside>
  );
};
