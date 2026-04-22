# Astral Sorcery Perk Editor

A browser-based drag-and-drop editor for designing the perk tree for the
[Astral Sorcery](https://github.com/HellFirePvP/AstralSorcery-1.18) Minecraft mod.

Exports the tree as:

- **Per-perk JSON files** — drop-in for `src/generated/resources/data/astralsorcery/perks/*.json`
- **PerkDataBuilder Java DSL** — paste into `AstralPerkTreeProvider.registerPerks(...)` for datagen

Perk types, attribute types, modifier modes, categories, and constellations
mirror the mod's runtime registries.

## Development

Requires Node.js 22+.

```sh
npm install
npm run dev
```

Then open <http://localhost:5173/>.

## Build

```sh
npm run build
```

Static assets output to `dist/`. A strict `Content-Security-Policy` meta tag
is injected only into production builds (see `vite.config.ts`).

## Stack

- [Vite](https://vite.dev/) + React 19 + TypeScript
- [React Flow](https://reactflow.dev/) for the node editor
- [Zustand](https://zustand.docs.pmnd.rs/) for state
