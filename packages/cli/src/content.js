import { readFileSync } from 'node:fs';

export const content = JSON.parse(readFileSync(new URL('./content.json', import.meta.url), 'utf8'));

export const fill = (text, vars = {}) =>
  text.replace(/\{\{(\w+)\}\}/g, (match, key) => (key in vars ? vars[key] : match));
