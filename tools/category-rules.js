'use strict';

const CANONICAL_LLM_CATEGORY = '大模型 LLM';
const LLM_CATEGORY_ALIASES = new Set([
  '大模型',
  'LLM',
  CANONICAL_LLM_CATEGORY,
]);

function normalizeCategoryNames(categories) {
  const names = categories
    .flat(Infinity)
    .map(category => String(category).trim())
    .filter(Boolean);
  const hasLlmCategory = names.some(name => LLM_CATEGORY_ALIASES.has(name));
  const normalized = names.filter(name => !LLM_CATEGORY_ALIASES.has(name));

  if (hasLlmCategory) normalized.unshift(CANONICAL_LLM_CATEGORY);

  return [...new Set(normalized)];
}

module.exports = {
  CANONICAL_LLM_CATEGORY,
  LLM_CATEGORY_ALIASES,
  normalizeCategoryNames,
};
