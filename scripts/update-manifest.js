import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

/**
 * Automation for update.json
 * 
 * Features:
 * 1. Version: Match current build tag (vX.X.X)
 * 2. Signatures: Extract from .sig files or AUTO-SIGN if missing
 * 3. URLs: Point to GitHub Release assets
 */

// export TAURI_SIGNING_PRIVATE_KEY_PATH="/Users/bwinvitboonsri/.tauri/expensy.key"
// export TAURI_SIGNING_PRIVATE_KEY_PASSWORD="01470147"
// npm run update-manifest


const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const version = packageJson.version;
const buildTag = `v${version}`;

const updateJsonPath = 'update.json';
const updateJson = JSON.parse(fs.readFileSync(updateJsonPath, 'utf8'));

// Update version and date
updateJson.version = buildTag;
updateJson.pub_date = new Date().toISOString();

const findFile = (dir, pattern, ext = '') => {
    if (!fs.existsSync(dir)) return null;
    const files = fs.readdirSync(dir);
    return files.find(f => f.toLowerCase().includes(pattern.toLowerCase()) && f.endsWith(ext));
};

const platforms = [
    {
        key: 'darwin-aarch64',
        dirs: ['src-tauri/target/release/bundle/macos'],
        pattern: version, // match only current version .tar.gz
        binaryExt: '.tar.gz',
        url: `https://github.com/pwinvitboonsri/expensy/releases/download/${buildTag}/expensy_${version}_aarch64.tar.gz`
    },
    {
        key: 'darwin-x86_64',
        dirs: ['src-tauri/target/release/bundle/macos'],
        pattern: version, // match only current version .tar.gz
        binaryExt: '.tar.gz',
        url: `https://github.com/pwinvitboonsri/expensy/releases/download/${buildTag}/expensy_${version}_x64.tar.gz`
    },
    {
        key: 'windows-x86_64',
        dirs: ['src-tauri/target/release/bundle/msi', 'src-tauri/target/release/bundle/nsis'],
        pattern: version, // match only current version .msi.zip
        binaryExt: '.msi.zip',
        url: `https://github.com/pwinvitboonsri/expensy/releases/download/${buildTag}/expensy_${version}_x64_en-US.msi.zip`
    }
];

console.log(`🔍 Scanning for build artifacts for version ${version}...`);

platforms.forEach(p => {
    if (updateJson.platforms[p.key]) {
        updateJson.platforms[p.key].url = p.url;
        
        let foundSig = null;
        let binaryPath = null;

        // 1. Try to find existing .sig file
        for (const dir of p.dirs) {
            const sigFile = findFile(dir, p.pattern, '.sig');
            if (sigFile) {
                foundSig = path.join(dir, sigFile);
                console.log(`✅ [${p.key}] Found existing signature: ${sigFile}`);
                break;
            }
            // Also keep track of the binary in case we need to sign it
            const binFile = findFile(dir, p.pattern, p.binaryExt);
            if (binFile) binaryPath = path.join(dir, binFile);
        }
        
        // 2. If no .sig but we found the binary, try to AUTO-SIGN
        if (!foundSig && binaryPath) {
            console.log(`✍️  [${p.key}] No .sig found, attempting to sign ${path.basename(binaryPath)}...`);
            try {
                // Try to use environment variables for signing
                const signCmd = `npx tauri signer sign "${binaryPath}"`;
                execSync(signCmd, { stdio: 'inherit', env: { ...process.env } });
                const sigFile = binaryPath + '.sig';
                if (fs.existsSync(sigFile)) {
                    foundSig = sigFile;
                    console.log(`✅ [${p.key}] Successfully signed binary.`);
                }
            } catch (err) {
                console.error(`❌ [${p.key}] Failed to sign binary. Error: ${err.message}`);
            }
        }

        if (foundSig) {
            const signature = fs.readFileSync(foundSig, 'utf8').trim();
            updateJson.platforms[p.key].signature = signature;
        } else {
            updateJson.platforms[p.key].signature = "MISSING_SIGNATURE";
            console.warn(`⚠️  [${p.key}] Signature still missing.`);
        }
    }
});

fs.writeFileSync(updateJsonPath, JSON.stringify(updateJson, null, 4));
console.log(`\n🚀 update.json updated to version ${buildTag}`);
console.log(`🔗 Release URL: https://github.com/pwinvitboonsri/expensy/releases/tag/${buildTag}\n`);

