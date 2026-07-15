const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const publicDir = path.join(projectRoot, 'public');
const deployDir = path.join(projectRoot, '.deploy_pages');
const repository = process.env.BLOG_DEPLOY_REPO
  || 'https://github.com/mortalkit1101-ui/mortalkit1101-ui.github.io.git';

function git(args, cwd = projectRoot, capture = false) {
  return execFileSync('git', args, {
    cwd,
    encoding: capture ? 'utf8' : undefined,
    stdio: capture ? ['ignore', 'pipe', 'inherit'] : 'inherit',
  });
}

function assertInsideWorkspace(target) {
  const resolvedTarget = path.resolve(target);
  const workspacePrefix = `${projectRoot}${path.sep}`;

  if (!resolvedTarget.startsWith(workspacePrefix)) {
    throw new Error(`Refusing to modify a path outside the workspace: ${resolvedTarget}`);
  }
}

function clearDeployTree() {
  assertInsideWorkspace(deployDir);

  for (const entry of fs.readdirSync(deployDir, { withFileTypes: true })) {
    if (entry.name === '.git') continue;

    const target = path.join(deployDir, entry.name);
    assertInsideWorkspace(target);
    fs.rmSync(target, { recursive: true, force: true });
  }
}

if (!fs.existsSync(publicDir)) {
  throw new Error('Missing public directory. Run the Hexo build before publishing.');
}

if (!fs.existsSync(path.join(deployDir, '.git'))) {
  if (fs.existsSync(deployDir)) {
    assertInsideWorkspace(deployDir);
    fs.rmSync(deployDir, { recursive: true, force: true });
  }

  git(['clone', '--branch', 'main', '--single-branch', repository, deployDir]);
} else {
  git(['remote', 'set-url', 'origin', repository], deployDir);
  git(['fetch', 'origin', 'main'], deployDir);
  git(['checkout', '-B', 'main', 'origin/main'], deployDir);
  git(['reset', '--hard', 'origin/main'], deployDir);
}

git(['config', 'core.autocrlf', 'false'], deployDir);
clearDeployTree();

for (const entry of fs.readdirSync(publicDir, { withFileTypes: true })) {
  fs.cpSync(
    path.join(publicDir, entry.name),
    path.join(deployDir, entry.name),
    { recursive: true },
  );
}

git(['add', '--all'], deployDir);

const status = git(['status', '--porcelain'], deployDir, true).trim();
if (!status) {
  console.log('No generated-site changes to publish.');
  process.exit(0);
}

const timestamp = new Date().toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, ' UTC');
git(['commit', '-m', `Deploy blog: ${timestamp}`], deployDir);
git(['push', 'origin', 'main'], deployDir);

console.log('Published generated site to main with a normal Git push.');
