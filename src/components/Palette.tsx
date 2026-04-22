import { useMemo } from "react";
import { useStore } from "../store";
import { PERK_TYPES } from "../constants";

export const Palette = () => {
  const addPerk = useStore((s) => s.addPerk);

  const grouped = useMemo(() => {
    const groups: Record<string, typeof PERK_TYPES[number][]> = {};
    for (const t of PERK_TYPES) {
      (groups[t.group] ??= []).push(t);
    }
    return groups;
  }, []);

  const handleAdd = (key: string) => {
    const x = 200 + Math.random() * 400;
    const y = 150 + Math.random() * 300;
    addPerk(key, { x, y });
  };

  return (
    <aside className="panel palette">
      <h3>Palette</h3>
      {Object.entries(grouped).map(([group, types]) => (
        <div key={group} className="palette-group">
          <div className="palette-group-title">{group}</div>
          {types.map((t) => (
            <button key={t.key} className="palette-item" onClick={() => handleAdd(t.key)} title={t.key}>
              {t.field}
            </button>
          ))}
        </div>
      ))}
    </aside>
  );
};
