const fs = require('fs');
const path = require('path');

// Function to increment the version number
function incrementVersion(version) {
    const versionParts = version.split('.').map(Number);
    versionParts[2] += 1; // Increment the patch version
    return versionParts.join('.');
}

// Update package.json
const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = require(packageJsonPath);
const newVersion = incrementVersion(packageJson.version);
packageJson.version = newVersion;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');

// Update version.js
const versionFilePath = path.join(__dirname, '../src/version.js');
const versionFileContent = `export const version = "${newVersion}";\n`;
fs.writeFileSync(versionFilePath, versionFileContent, 'utf8');

console.log(`Updated to version ${newVersion}`);
