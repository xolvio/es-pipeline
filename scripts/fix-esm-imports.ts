#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

// Get the dist directory relative to where this script is called from
const distDir = `${process.cwd()}/dist`;

function resolveImportPath(dir: string, importPath: string): string | null {
  if (importPath.includes('/gql') || importPath === './gql') return null;
  if (importPath.endsWith('.js')) return null;

  const possibleDirPath = join(dir, importPath);
  try {
    if (existsSync(possibleDirPath) && existsSync(join(possibleDirPath, 'index.js'))) {
      return `${importPath}/index.js`;
    }
  } catch {
    // If we can't check, just add .js
  }
  return `${importPath}.js`;
}

async function fixImports(dir: string): Promise<void> {
  const files = await readdir(dir, { withFileTypes: true });

  for (const file of files) {
    const fullPath = join(dir, file.name);

    if (file.isDirectory()) {
      await fixImports(fullPath);
    } else if (file.name.endsWith('.js')) {
      let content = await readFile(fullPath, 'utf-8');

      content = content.replace(/from ['"](\.[^'"]+)['"];/g, (match, importPath) => {
        const resolved = resolveImportPath(dir, importPath);
        return resolved ? `from '${resolved}';` : match;
      });

      content = content.replace(/export \* from ['"](\.[^'"]+)['"];/g, (match, importPath) => {
        const resolved = resolveImportPath(dir, importPath);
        return resolved ? `export * from '${resolved}';` : match;
      });

      content = content.replace(/import\(['"](\.[^'"]+)['"]\)/g, (match, importPath) => {
        const resolved = resolveImportPath(dir, importPath);
        return resolved ? `import('${resolved}')` : match;
      });

      await writeFile(fullPath, content);
    }
  }
}

await fixImports(distDir);
console.log('Fixed ESM imports in dist/');
