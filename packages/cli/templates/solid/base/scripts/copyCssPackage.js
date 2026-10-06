import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';

const projectRoot = resolve(process.argv[2] ?? '');
const workspaceRoot = process.cwd();
const outputRoot = resolve(workspaceRoot, 'dist', relative(workspaceRoot, projectRoot));
const packageJson = JSON.parse(readFileSync(resolve(projectRoot, 'package.json'), 'utf8'));
mkdirSync(outputRoot, { recursive: true });
copyFileSync(resolve(projectRoot, 'src/styles.css'), resolve(outputRoot, 'styles.css'));
copyFileSync(resolve(projectRoot, 'package.json'), resolve(outputRoot, 'package.json'));
console.log(`Built ${packageJson.name} to ${outputRoot}`);
