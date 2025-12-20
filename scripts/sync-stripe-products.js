import { copyFileSync, existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';

const ROOT = process.cwd();
const source = join(ROOT, 'stripe-products.json');
const target = join(ROOT, 'public', 'stripe-products.json');

if (!existsSync(source)) {
  console.warn('⚠️  .stripe-products.json not found – skipping copy. Run npm run stripe:create first.');
  process.exit(0);
}

mkdirSync(dirname(target), { recursive: true });
copyFileSync(source, target);
console.log('✅ Copied stripe-products.json to public/stripe-products.json');
