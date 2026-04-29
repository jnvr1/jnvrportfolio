/**
 * Standalone CLI script: check bilingual parity by reading the filesystem.
 * Invoked via: npm run check:parity
 * Works outside the Astro build context — reads content dirs directly.
 *
 * Usage: node --import tsx/esm scripts/check-bilingual-parity.ts
 * (tsx is used via package.json script so no global install needed)
 */
import { readdirSync, existsSync } from 'node:fs';
import { join, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkBilingualParity, type ParityEntry } from '../src/content/bilingual-parity.ts';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const contentRoot = join(__dirname, '..', 'src', 'content', 'projects');

function getSlugFiles(locale: 'es' | 'en'): ParityEntry[] {
  const dir = join(contentRoot, locale);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => extname(f) === '.md' && !f.startsWith('.'))
    .map((f) => ({ slug: basename(f, '.md'), locale }));
}

const esEntries = getSlugFiles('es');
const enEntries = getSlugFiles('en');
const allEntries: ParityEntry[] = [...esEntries, ...enEntries];

console.log(`\nBilingual Parity Check`);
console.log(`  ES slugs (${esEntries.length}): ${esEntries.map((e) => e.slug).join(', ') || '(none)'}`);
console.log(`  EN slugs (${enEntries.length}): ${enEntries.map((e) => e.slug).join(', ') || '(none)'}`);

const result = checkBilingualParity(allEntries);

if (result.ok) {
  console.log('\n✓ All slugs have both ES and EN counterparts.\n');
  process.exit(0);
} else {
  console.error('\n✗ Bilingual parity broken!');
  if (result.missingEn.length) {
    console.error(`  Missing EN counterpart for: ${result.missingEn.join(', ')}`);
  }
  if (result.missingEs.length) {
    console.error(`  Missing ES counterpart for: ${result.missingEs.join(', ')}`);
  }
  console.error('');
  process.exit(1);
}
