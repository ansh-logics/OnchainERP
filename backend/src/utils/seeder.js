/**
 * Legacy entrypoint: `npm run seed:import` / `seed:delete` now run
 * `src/scripts/seed-temp.js` (see package.json).
 * This file remains so older docs or CI that invoke seeder.js directly still work.
 */
const { spawnSync } = require('child_process');
const path = require('path');

const script = path.join(__dirname, '../scripts/seed-temp.js');
const arg = process.argv[2] === '-d' ? '--delete' : '--import';
const r = spawnSync(process.execPath, [script, arg], { stdio: 'inherit' });
process.exit(r.status ?? 1);
