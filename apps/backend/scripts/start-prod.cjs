const { spawnSync } = require('child_process');
const path = require('path');

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: process.env,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run('npx', ['prisma', 'migrate', 'deploy', '--schema', 'prisma/schema.prisma']);

if (process.env.SEED_ON_BOOT === 'true') {
  run('npx', ['prisma', 'db', 'seed', '--schema', 'prisma/schema.prisma']);
}

run('node', ['-r', 'tsconfig-paths/register', path.join('dist', 'main.js')]);
