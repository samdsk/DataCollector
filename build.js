const fs = require("fs");
const {execSync} = require("child_process");
const archiver = require("archiver");

const BUILD_DIR = "build";
const ZIP_NAME = "deploy.zip";

console.log("==> Cleaning previous build...");
fs.rmSync(BUILD_DIR, {recursive: true, force: true});
fs.rmSync(ZIP_NAME, {force: true});

console.log("==> Creating build directory...");
fs.mkdirSync(BUILD_DIR);

// Copy files to build/
execSync(`cp -r index.js package*.json src config ${BUILD_DIR}`);

console.log("==> Creating ZIP...");
const output = fs.createWriteStream(ZIP_NAME);
const archive = archiver("zip", {zlib: {level: 9}});

archive.pipe(output);
archive.directory(BUILD_DIR, false);
archive.finalize();

output.on("close", () => {
    console.log(`==> ZIP created: ${ZIP_NAME} (${archive.pointer()} total bytes)`);
});