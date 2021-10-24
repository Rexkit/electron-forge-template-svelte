"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const template_base_1 = require("@electron-forge/template-base");
const async_ora_1 = require("@electron-forge/async-ora");
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const currentVersion = require("../package").electronForgeVersion;
class SvelteTemplate extends template_base_1.BaseTemplate {
    constructor() {
        super(...arguments);
        this.requiredForgeVersion = `^${currentVersion}`;
        this.templateDir = path_1.default.resolve(__dirname, "..", "tmpl");
        this.dependencies = ["concurrently", "sirv-cli"];
        this.initializeTemplate = async (directory, options) => {
            await super.initializeTemplate(directory, options);
            await (0, async_ora_1.asyncOra)("Setting up Forge configuration", async () => {
                const pjPath = path_1.default.resolve(directory, "package.json");
                const currentPJ = await fs_extra_1.default.readJson(pjPath);
                currentPJ.main = "src/index.js";
                currentPJ.scripts.start =
                    'concurrently "npm:svelte-dev" "electron-forge start"';
                currentPJ.scripts["svelte-build"] = 'rollup -c"';
                currentPJ.scripts["svelte-dev"] = "rollup -c -w";
                currentPJ.scripts["svelte-start"] = "sirv public --no-clear";
                await fs_extra_1.default.writeJson(pjPath, currentPJ, {
                    spaces: 2,
                });
            });
            await (0, async_ora_1.asyncOra)("Setting up svelte init files", async () => {
                await this.copyTemplateFile(directory, "rollup.config.js");
                await this.copyTemplateFile(path_1.default.join(directory, "public"), "index.html");
                await this.copyTemplateFile(path_1.default.join(directory, "public"), "favicon.png");
                await this.copyTemplateFile(path_1.default.join(directory, "public"), "global.css");
                await this.copyTemplateFile(path_1.default.join(directory, "src"), "App.svelte");
                await this.copyTemplateFile(path_1.default.join(directory, "src"), "app.js");
                await this.deleteFile(path_1.default.resolve(directory, "src"), "index.html");
                await this.deleteFile(path_1.default.resolve(directory, "src"), "index.css");
                await this.updateFileByLine(path_1.default.resolve(directory, "src", "index.js"), (line) => {
                    if (line.includes("mainWindow.loadFile"))
                        return '  mainWindow.loadFile(path.join(__dirname, "../public/index.html"));';
                    return line;
                });
            });
        };
    }
    async deleteFile(dir, basename) {
        await fs_extra_1.default.remove(path_1.default.resolve(dir, basename));
    }
}
exports.default = new SvelteTemplate();
