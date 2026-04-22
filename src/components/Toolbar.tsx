import { useRef, useState } from "react";
import { useStore } from "../store";
import { exportJava, exportJson, exportLang, exportProject, type PerkFile } from "../export";
import { parseProject } from "../import";
import type { Edge } from "reactflow";
import type { PerkNode } from "../store";

type ExportView =
  | { kind: "json"; files: PerkFile[] }
  | { kind: "java"; source: string }
  | { kind: "lang"; source: string }
  | null;

export const Toolbar = ({ snapOn }: { snapOn: boolean }) => {
  const nodes = useStore((s) => s.nodes);
  const edges = useStore((s) => s.edges);
  const loadState = useStore((s) => s.loadState);
  const updatePerk = useStore((s) => s.updatePerk);
  const [view, setView] = useState<ExportView>(null);
  const [activeFile, setActiveFile] = useState(0);
  const fileInput = useRef<HTMLInputElement>(null);
  const langInput = useRef<HTMLInputElement>(null);

  const downloadProject = () => {
    const data = exportProject(nodes, edges);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "perk-tree.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadProject = async (file: File) => {
    const text = await file.text();
    try {
      const parsed: unknown = JSON.parse(text);
      const project = parseProject(parsed);
      const loadedNodes: PerkNode[] = project.nodes.map((n) => ({
        id: n.id,
        position: n.position,
        data: n.data,
        type: "perk",
      }));
      const loadedEdges: Edge[] = project.edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        type: "straight",
      }));
      loadState(loadedNodes, loadedEdges);
    } catch (err) {
      alert(`Failed to load project: ${String(err)}`);
    }
  };

  const importLang = async (file: File) => {
    const text = await file.text();
    try {
      const parsed: unknown = JSON.parse(text);
      if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("expected a JSON object at the root");
      }
      const dict = parsed as Record<string, unknown>;
      let filled = 0;
      let skipped = 0;
      for (const node of nodes) {
        const base = node.data.name_key;
        const nameVal = dict[`${base}.name`];
        const descVal = dict[`${base}.description`];
        const patch: { display_name?: string; description?: string } = {};
        if (typeof nameVal === "string") patch.display_name = nameVal;
        if (typeof descVal === "string") patch.description = descVal;
        if (patch.display_name !== undefined || patch.description !== undefined) {
          updatePerk(node.id, patch);
          filled += 1;
        } else {
          skipped += 1;
        }
      }
      alert(`Imported keys for ${filled} perk(s). ${skipped} had no matching keys.`);
    } catch (err) {
      alert(`Failed to import en_us.json: ${String(err)}`);
    }
  };

  const copy = (text: string) => navigator.clipboard.writeText(text);

  return (
    <>
      <div className="toolbar">
        <span className="title">Astral Perk Editor</span>
        <span className="stat">{nodes.length} perks · {edges.length} links</span>
        <span className={snapOn ? "stat snap-on" : "stat snap-off"}>
          grid: {snapOn ? "on" : "free (shift)"}
        </span>
        <div className="spacer" />
        <button
          onClick={() => {
            setView({ kind: "json", files: exportJson(nodes, edges) });
            setActiveFile(0);
          }}
        >
          Export JSON
        </button>
        <button onClick={() => setView({ kind: "java", source: exportJava(nodes, edges) })}>
          Export Java DSL
        </button>
        <button onClick={() => setView({ kind: "lang", source: exportLang(nodes) })}>
          Export en_us.json
        </button>
        <button onClick={() => langInput.current?.click()}>Import en_us.json</button>
        <button onClick={downloadProject}>Save project</button>
        <button onClick={() => fileInput.current?.click()}>Load project</button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json"
          style={{ display: "none" }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) loadProject(f);
            e.target.value = "";
          }}
        />
        <input
          ref={langInput}
          type="file"
          accept="application/json"
          style={{ display: "none" }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) importLang(f);
            e.target.value = "";
          }}
        />
      </div>

      {view && (
        <div className="modal-backdrop" onClick={() => setView(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>
                {view.kind === "json"
                  ? "JSON export"
                  : view.kind === "java"
                  ? "Java DSL export"
                  : "en_us.json export"}
              </h3>
              <button onClick={() => setView(null)}>close</button>
            </div>
            {view.kind === "json" ? (
              <>
                <div className="tabs">
                  {view.files.length === 0 && <span className="hint">No perks yet.</span>}
                  {view.files.map((f, i) => (
                    <button
                      key={f.filename}
                      className={i === activeFile ? "tab active" : "tab"}
                      onClick={() => setActiveFile(i)}
                    >
                      {f.filename.split("/").pop()}
                    </button>
                  ))}
                </div>
                {view.files[activeFile] && (
                  <>
                    <div className="filepath">{view.files[activeFile].filename}</div>
                    <pre>{view.files[activeFile].content}</pre>
                    <div className="modal-actions">
                      <button onClick={() => copy(view.files[activeFile].content)}>Copy this file</button>
                      <button
                        onClick={() =>
                          copy(
                            view.files
                              .map((f) => `// ${f.filename}\n${f.content}`)
                              .join("\n\n")
                          )
                        }
                      >
                        Copy all
                      </button>
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                <pre>{view.source}</pre>
                <div className="modal-actions">
                  <button onClick={() => copy(view.source)}>Copy</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};
