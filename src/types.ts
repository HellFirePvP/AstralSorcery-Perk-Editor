import type { AttributeKey, ConstellationKey, ModifierMode, PerkCategory, PerkTypeKey } from "./constants";

export type ModifierEntry = {
  id: string;
  attribute_type: AttributeKey;
  mode: ModifierMode;
  value: number;
};

export type RequirementConstellation = {
  id: string;
  type: "astralsorcery:constellation";
  constellation: ConstellationKey;
};

export type RequirementProgress = {
  id: string;
  type: "astralsorcery:progress";
  progress: string;
};

export type Requirement = RequirementConstellation | RequirementProgress;

export type PerkData = {
  registry_name: string;
  type: PerkTypeKey;
  name_key: string;
  category: PerkCategory;
  modifiers: ModifierEntry[];
  requirements: Requirement[];
  constellation?: ConstellationKey;
  display_name?: string;
  description?: string;
};
