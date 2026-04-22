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
    const cell = 100;
    const x = (2 + Math.floor(Math.random() * 5)) * cell;
    const y = (1 + Math.floor(Math.random() * 4)) * cell;
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
