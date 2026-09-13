#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

try {
  const distDir = path.join(__dirname, '..', 'dist');
  const gitCacheDir = path.join(require('os').tmpdir(), 'gh-pages-coinboxadmin');
  const repoUrl = 'https://github.com/mohoshin47/coinboxadmin.git';
  const branch = 'main';

  console.log('Starting deployment...');
  console.log('Source directory:', distDir);
  console.log('Repository:', repoUrl);
  console.log('Target branch:', branch);

  // Clean up old cache
  if (fs.existsSync(gitCacheDir)) {
    console.log('Removing old cache...');
    execSync(`rmdir /s /q "${gitCacheDir}"`, { stdio: 'inherit', shell: 'cmd' });
  }

  // Create new cache directory
  console.log('Creating cache directory...');
  fs.mkdirSync(gitCacheDir, { recursive: true });

  // Try to clone the branch
  console.log(`Attempting to clone ${branch} branch...`);
  try {
    execSync(`git clone --depth 1 --branch ${branch} ${repoUrl} "${gitCacheDir}"`, {
      stdio: 'inherit',
      shell: 'cmd',
    });

    // Clear existing files (except .git) to ensure a clean deploy
    console.log('Clearing existing files in target branch...');
    const files = fs.readdirSync(gitCacheDir);
    for (const file of files) {
      if (file !== '.git') {
        const filePath = path.join(gitCacheDir, file);
        if (fs.statSync(filePath).isDirectory()) {
          execSync(`rmdir /s /q "${filePath}"`, { shell: 'cmd' });
        } else {
          fs.unlinkSync(filePath);
        }
      }
    }
  } catch (cloneError) {
    console.log(`${branch} branch not found or clone failed. Initializing new repo...`);
    execSync(`git init`, { cwd: gitCacheDir, stdio: 'inherit', shell: 'cmd' });
    execSync(`git remote add origin ${repoUrl}`, { cwd: gitCacheDir, stdio: 'inherit', shell: 'cmd' });
    execSync(`git checkout -b ${branch}`, { cwd: gitCacheDir, stdio: 'inherit', shell: 'cmd' });
  }

  // Copy dist files to the repository
  console.log('Copying files from dist...');
  const distFiles = getAllFiles(distDir);
  for (const file of distFiles) {
    const source = path.join(distDir, file);
    const target = path.join(gitCacheDir, file);
    const targetDir = path.dirname(target);
    fs.mkdirSync(targetDir, { recursive: true });
    fs.copyFileSync(source, target);
  }

  // Git add and commit
  console.log('Committing changes...');
  execSync(`git add -A`, {
    cwd: gitCacheDir,
    stdio: 'inherit',
    shell: 'cmd',
  });

  // Check if there are changes to commit
  try {
    execSync(`git diff --cached --quiet`, {
      cwd: gitCacheDir,
      shell: 'cmd',
    });
    console.log('No changes to commit.');
    process.exit(0);
  } catch (e) {
    // There are changes, proceed with commit
  }

  const dateStr = new Date().toISOString();
  execSync(`git commit -m "Deploy: ${dateStr}"`, {
    cwd: gitCacheDir,
    stdio: 'inherit',
    shell: 'cmd',
  });

  // Push to repository
  console.log(`Pushing to ${branch} repository...`);
  execSync(`git push -u origin ${branch} --force`, {
    cwd: gitCacheDir,
    stdio: 'inherit',
    shell: 'cmd',
  });

  console.log('Deployment successful!');
} catch (error) {
  console.error('Deployment failed:', error.message);
  process.exit(1);
}

function getAllFiles(dir) {
  const files = [];

  function traverse(currentDir, prefix = '') {
    if (!fs.existsSync(currentDir)) return;
    const entries = fs.readdirSync(currentDir);
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry);
      const relativePath = prefix ? `${prefix}/${entry}` : entry;
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        traverse(fullPath, relativePath);
      } else {
        files.push(relativePath);
      }
    }
  }

  traverse(dir);
  return files;
}
