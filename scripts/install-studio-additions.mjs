import fs from 'node:fs/promises';
import path from 'node:path';

const studio = path.resolve(process.argv[2] || '');
if (!process.argv[2]) throw new Error('Pass the existing Studio directory as the first argument.');
const schemaRoot = path.join(studio, 'schemaTypes');
await fs.access(path.join(studio, 'sanity.config.ts'));
await fs.access(path.join(schemaRoot, 'documents/project.ts'));
await fs.copyFile(path.resolve('sanity-additions/afterimageFields.ts'), path.join(schemaRoot, 'afterimageFields.ts'));
for (const [file, symbol] of [['project.ts', 'afterimageProjectFields'], ['siteSettings.ts', 'afterimageSiteFields']]) {
  const target = path.join(schemaRoot, 'documents', file);
  const original = await fs.readFile(target, 'utf8');
  if (original.includes(`...${symbol}`)) { console.log(`${file}: already integrated`); continue; }
  if (!/fields:\s*\[/.test(original)) throw new Error(`Could not find field list in ${file}`);
  await fs.writeFile(`${target}.before-afterimage.bak`, original, { flag: 'wx' });
  const modified = `import { ${symbol} } from "../afterimageFields";\n` + original.replace(/fields:\s*\[/, `fields: [\n    ...${symbol},`);
  await fs.writeFile(target, modified);
  console.log(`${file}: optional fields integrated; original backed up`);
}
console.log('No documents were written or published. Remote Studio was not deployed.');
