import simpleGit from 'simple-git';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const repoUrl = 'https://github.com/BF667-IDLE/resbot-ai.git';
const currentPath = path.resolve(__dirname, '..');
const tempRepoPath = path.join(currentPath, 'tmp-repo'); // Folder sementara

// Fungsi untuk mendapatkan versi dari package.json
function getVersionFromPackageJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const packageJson = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  return packageJson.version;
}

async function cloneRepoToTemp() {
  if (!fs.existsSync(tempRepoPath)) {
    fs.mkdirSync(tempRepoPath, { recursive: true });
  }

  const git = simpleGit(tempRepoPath);

  try {
    console.log('Check Update ...')
    await git.clone(repoUrl, '.');
  } catch (err) {
    throw err;
  }
}

function copyFiles(src, dest) {
  const files = fs.readdirSync(src);
  for (const file of files) {
    const srcFilePath = path.join(src, file);
    const destFilePath = path.join(dest, file);

    if (fs.statSync(srcFilePath).isDirectory()) {
      fs.mkdirSync(destFilePath, { recursive: true });
      copyFiles(srcFilePath, destFilePath);
    } else {
      fs.copyFileSync(srcFilePath, destFilePath);
    }
  }
}

function cleanUpTempRepo() {
  if (fs.existsSync(tempRepoPath)) {
    fs.rmSync(tempRepoPath, { recursive: true, force: true });
  }
}

async function cloneOrUpdateRepo() {
  try {
    if (!process.versions.node) {
      throw new Error('Node.js is not installed. Please install Node.js to run this script.');
    }

    // Ambil versi dari package.json lokal
    const localPackageJsonPath = path.join(currentPath, 'package.json');
    const localVersion = getVersionFromPackageJson(localPackageJsonPath);

    // Clone repositori ke folder sementara untuk mendapatkan package.json terbaru
    await cloneRepoToTemp();

    // Ambil versi dari package.json di repositori (tempRepoPath)
    const tempPackageJsonPath = path.join(tempRepoPath, 'package.json');
    const remoteVersion = getVersionFromPackageJson(tempPackageJsonPath);

    // Cek apakah versi berbeda
    if (localVersion !== remoteVersion) {
        console.log('Update available! Starting the update process...');
        copyFiles(tempRepoPath, currentPath);
        console.log('Files updated successfully! Script is now up-to-date.');
    } else {
        console.log('Script is already up-to-date.');
    }
    

    cleanUpTempRepo();
  } catch (err) {
    console.error('Error during git operation:', err.message);
  }
}

export { cloneOrUpdateRepo };
