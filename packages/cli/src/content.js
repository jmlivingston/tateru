import { readFileSync } from 'node:fs';

export const content = JSON.parse(readFileSync(new URL('./content.json', import.meta.url), 'utf8'));

// {{#key}}...{{/key}} keeps its lines when vars[key] is truthy, {{^key}}...{{/key}} when it is falsy. Markers sit on their own lines.
const SECTION = /^[ \t]*\{\{([#^])(\w+)\}\}[ \t]*\r?\n([\s\S]*?)^[ \t]*\{\{\/\2\}\}[ \t]*(?:\r?\n|$)/gm;

const renderSections = (text, vars) =>
  text.replace(SECTION, (match, kind, key, body) =>
    Boolean(vars[key]) === (kind === '#') ? renderSections(body, vars) : ''
  );

export const fill = (text, vars = {}) =>
  renderSections(text, vars).replace(/\{\{(\w+)\}\}/g, (match, key) => (key in vars ? vars[key] : match));
