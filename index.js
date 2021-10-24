const fs = require("fs");
const path = require("path");

module.exports = {
  dependencies: ["concurrently", "sirv-cli"],
  devDependencies: [
    "@rollup/plugin-commonjs",
    "@rollup/plugin-node-resolve",
    "rollup",
    "rollup-plugin-css-only",
    "rollup-plugin-livereload",
    "rollup-plugin-svelte",
    "rollup-plugin-terser",
    "svelte",
  ],
  templateDirectory: path.resolve(__dirname, "./tmpl"),
  postCopy: (initDir, ora, lintStyle) => {
    const packageJSONPath = path.resolve(initDir, "package.json");
    const packageJSON = require(packageJSONPath);
    const gitignorePath = path.resolve(initDir, ".gitignore");
    packageJSON.main = "src/index.js";
    packageJSON.scripts.lint = "eslint --cache --color --ext .jsx,.js src";
    fs.writeFileSync(packageJSONPath, JSON.stringify(packageJSON, null, 2));
    fs.appendFileSync(gitignorePath, `.eslintcache`);
  },
};
