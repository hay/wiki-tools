#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// [ npmPackageName, vendorDirName ]
const packages = [
    [ "bootstrap", "bootstrap" ],
    [ "fastclick", "fastclick" ],
    [ "jquery", "jquery" ],
    [ "stupid-table-plugin", "jquery-stupid-table" ]
];

const srcRoot = path.resolve(__dirname, "../node_modules");
const destRoot = path.resolve(__dirname, "../public_html/vendor");

function copyDir(src, dest) {
    fs.mkdirSync(dest, { recursive : true });

    for (const entry of fs.readdirSync(src, { withFileTypes : true })) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

for (const [ npmName, vendorName ] of packages) {
    const src = path.join(srcRoot, npmName);
    const dest = path.join(destRoot, vendorName);
    console.log(`Copying ${npmName} to public_html/vendor/${vendorName}`);
    copyDir(src, dest);
}