import { useState } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import type { PerkData } from "../types";
import { CATEGORY_COLORS, CONSTELLATIONS, GROUP_COLORS, PERK_TYPES } from "../constants";

const radiusByCategory: Record<string, number> = {
  root: 42,
  major: 30,
  epiphany: 30,
  default: 22,
};

export const PerkNode = ({ data, selected, xPos, yPos }: NodeProps<PerkData>) => {
  const typeDef = PERK_TYPES.find((t) => t.key === data.type);
  const group = typeDef?.group ?? "generic";
  const fill = GROUP_COLORS[group] ?? "#7aa6da";
  const ring = CATEGORY_COLORS[data.category] ?? "#cccccc";
  const r = radiusByCategory[data.category] ?? 22;
  const constColor = data.constellation
    ? CONSTELLATIONS.find((c) => c.key === data.constellation)?.color
    : undefined;
  const shortLabel = data.display_name?.trim() || data.registry_name.replace(/^astralsorcery:/, "");
  const size = r * 2 + 12;
  const [hovered, setHovered] = useState(false);
  const coordX = Math.round(xPos);
  const coordY = Math.round(yPos);

  return (
    <div
      style={{
        width: size,
        height: size,
        position: "relative",
        cursor: "grab",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Handle
        type="source"
        position={Position.Top}
        className="perk-handle"
        style={{ ["--perk-hit-size" as string]: `${r * 0.9}px` } as React.CSSProperties}
      />
      <svg width={size} height={size} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {constColor && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r + 4}
            fill="none"
            stroke={constColor}
            strokeWidth={2}
            opacity={0.55}
          />
        )}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill={fill}
          stroke={selected ? "#ffffff" : ring}
          strokeWidth={selected ? 3 : 2}
          opacity={0.9}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r * 0.45}
          fill="#0b0f1a"
          opacity={0.55}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          top: size + 2,
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: 10,
          color: "#d8dde9",
          whiteSpace: "nowrap",
          textShadow: "0 0 4px #000",
          pointerEvents: "none",
        }}
      >
        {shortLabel}
      </div>
      {hovered && (
        <div
          style={{
            position: "absolute",
            bottom: size + 4,
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: 10,
            fontFamily: '"SF Mono", Consolas, monospace',
            color: "#e9d99a",
            background: "rgba(10,14,24,0.9)",
            border: "1px solid #2a3250",
            borderRadius: 3,
            padding: "2px 6px",
            whiteSpace: "nowrap",
            pointerEvents: "none",
          }}
        >
          x: {coordX}, y: {coordY}
        </div>
      )}
    </div>
  );
};
