'use strict';

const { execFileSync } = require('node:child_process');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const dryRun = process.argv.includes('--dry-run');
function git(args, capture = false) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8',
    stdio: capture ? ['ignore', 'pipe', 'inherit'] : 'inherit' });
}
function node(file, args = []) {
  execFileSync(process.execPath, [path.join(root, file), ...args], { cwd: root, stdio: 'inherit' });
}

try {
  if (git(['branch', '--show-current'], true).trim() !== 'source') {
    throw new Error('请切换到 source 分支后再发布。');
  }
  const repo = git(['remote', 'get-url', 'origin'], true).trim();
  if (process.env.BLOG_DEPLOY_REPO && process.env.BLOG_DEPLOY_REPO !== repo) {
    throw new Error('源码与网站仓库不一致，请先确认 BLOG_DEPLOY_REPO。');
  }
  process.env.BLOG_DEPLOY_REPO = repo;
  if (git(['diff', '--cached', '--name-only'], true).trim()) {
    throw new Error('已有暂存内容，请先提交或取消暂存后再使用一键发布。');
  }
  node('node_modules/hexo/bin/hexo', ['clean']);
  node('node_modules/hexo/bin/hexo', ['generate']);
  node('tools/verify-local-site.js');

  // Check authentication and remote changes before creating the source commit.
  git(['fetch', 'origin', 'source', 'main']);
  git(['merge-base', '--is-ancestor', 'origin/source', 'HEAD']);
  git(['push', '--dry-run', 'origin', 'HEAD:source']);
  git(['push', '--dry-run', 'origin', 'refs/remotes/origin/main:refs/heads/main']);
  if (dryRun) {
    node('tools/publish-blog.js', ['--dry-run']);
    console.log('发布演练通过：生成网页与两个分支的推送权限已检查，没有向 GitHub 上传内容。');
    process.exit(0);
  }
  git(['add', '--all']);
  if (git(['diff', '--cached', '--name-only'], true).trim()) {
    git(['commit', '-m', `Update blog source: ${new Date().toISOString()}`]);
  }
  git(['push', 'origin', 'HEAD:source']);
  node('tools/publish-blog.js');
  console.log('发布完成：文章源码已保存到 source，网站已推送到 main。');
} catch (error) {
  console.error('\n发布未完成。请检查上面的错误；文章文件仍保存在本地。');
  console.error('如果 GitHub 尚未登录，请运行 login.cmd；如果远端 source 有新提交，请先同步并解决冲突。');
  if (error.message && !error.status) console.error(error.message);
  process.exit(1);
}
