export type Rule = {
  id: string;
  match_tags?: string[];
  requires?: string[];
  excludes?: string[];
  depends_on?: string[];
  min?: { field: string; value: number }[];
  max?: { field: string; value: number }[];
  auto_add?: string[];
  auto_remove?: string[];
};

export type RuleResult = {
  derivedTags: string[];
  warnings: string[];
};

export function applyRules(
  tags: string[],
  numericFields: Record<string, number>,
  rules: Rule[]
): RuleResult {
  const derived = new Set<string>();
  const warnings: string[] = [];
  const activeTags = new Set(tags);

  for (const rule of rules) {
    const matches = (rule.match_tags ?? []).every((tag) => activeTags.has(tag));
    if (!matches) continue;

    if (rule.requires) {
      for (const required of rule.requires) {
        if (!activeTags.has(required)) {
          warnings.push(`Rule ${rule.id}: missing required tag ${required}`);
        }
      }
    }

    if (rule.excludes) {
      for (const excluded of rule.excludes) {
        if (activeTags.has(excluded)) {
          warnings.push(`Rule ${rule.id}: tag ${excluded} is excluded`);
        }
      }
    }

    if (rule.depends_on) {
      for (const dependency of rule.depends_on) {
        if (!activeTags.has(dependency)) {
          warnings.push(`Rule ${rule.id}: depends on ${dependency}`);
        }
      }
    }

    if (rule.min) {
      for (const constraint of rule.min) {
        const value = numericFields[constraint.field] ?? 0;
        if (value < constraint.value) {
          warnings.push(
            `Rule ${rule.id}: ${constraint.field} below minimum ${constraint.value}`
          );
        }
      }
    }

    if (rule.max) {
      for (const constraint of rule.max) {
        const value = numericFields[constraint.field] ?? 0;
        if (value > constraint.value) {
          warnings.push(
            `Rule ${rule.id}: ${constraint.field} above maximum ${constraint.value}`
          );
        }
      }
    }

    rule.auto_add?.forEach((tag) => derived.add(tag));
    rule.auto_remove?.forEach((tag) => {
      if (activeTags.has(tag)) {
        warnings.push(`Rule ${rule.id}: auto-remove ${tag}`);
      }
    });
  }

  return { derivedTags: [...derived], warnings };
}
