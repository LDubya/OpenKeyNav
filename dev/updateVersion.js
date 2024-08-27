const fs = require('fs');
const path = require('path');
const packageJson = require('../package.json');

const versionFilePath = path.join(__dirname, '../src/version.js');
const versionFileContent = `export const version = "${packageJson.version}";\n`;

fs.writeFileSync(versionFilePath, versionFileContent, 'utf8');

console.log(`version.js updated to version ${packageJson.version}`);
