import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fill } from './content.js';

const RENDERED_SUFFIX = '.tpl';
const templatesRoot = fileURLToPath(new URL('../templates/', import.meta.url));

const listFiles = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? listFiles(join(dir, entry.name)) : [join(dir, entry.name)]
  );

export const readTemplate = (name, file, vars) =>
  fill(readFileSync(join(templatesRoot, name, file), 'utf8'), vars);

// Files ending in .tpl are rendered with {{vars}} and lose the suffix; the rest, such as Nx generator templates, are copied as-is.
export const copyTemplate = ({ names, target, vars }) => {
  const written = [];
  const skipped = [];

  for (const name of names) {
    const source = join(templatesRoot, name);
    if (!existsSync(source)) continue;

    for (const file of listFiles(source)) {
      const rendered = file.endsWith(RENDERED_SUFFIX);
      const relativePath = relative(source, file);
      const outputPath = rendered ? relativePath.slice(0, -RENDERED_SUFFIX.length) : relativePath;
      const destination = join(target, outputPath);

      if (existsSync(destination)) {
        skipped.push(outputPath);
        continue;
      }

      mkdirSync(dirname(destination), { recursive: true });
      if (rendered) writeFileSync(destination, fill(readFileSync(file, 'utf8'), vars));
      else copyFileSync(file, destination);
      written.push(outputPath);
    }
  }

  return { written, skipped };
};
