import { InitTemplateOptions } from "@electron-forge/shared-types";
import { BaseTemplate } from "@electron-forge/template-base";
import { asyncOra } from "@electron-forge/async-ora";

import fs from "fs-extra";
import path from "path";

const currentVersion = require("../package").electronForgeVersion;

class SvelteTemplate extends BaseTemplate {
  public requiredForgeVersion = `^${currentVersion}`;
  public templateDir = path.resolve(__dirname, "..", "tmpl");

  public dependencies = ["concurrently", "sirv-cli"];

  async deleteFile(dir: string, basename: string): Promise<void> {
    await fs.remove(path.resolve(dir, basename));
  }

  public initializeTemplate = async (
    directory: string,
    options: InitTemplateOptions
  ) => {
    await super.initializeTemplate(directory, options);
    await asyncOra("Setting up Forge configuration", async () => {
      const pjPath = path.resolve(directory, "package.json");
      const currentPJ = await fs.readJson(pjPath);
      currentPJ.main = "src/index.js";
      currentPJ.scripts.start =
        'concurrently "npm:svelte-dev" "electron-forge start"';
      currentPJ.scripts["svelte-build"] = 'rollup -c"';
      currentPJ.scripts["svelte-dev"] = "rollup -c -w";
      currentPJ.scripts["svelte-start"] = "sirv public --no-clear";
      await fs.writeJson(pjPath, currentPJ, {
        spaces: 2,
      });
    });
    await asyncOra("Setting up Svelte init files", async () => {
      await this.copyTemplateFile(directory, "rollup.config.js");
      await this.copyTemplateFile(path.join(directory, "public"), "index.html");
      await this.copyTemplateFile(
        path.join(directory, "public"),
        "favicon.png"
      );
      await this.copyTemplateFile(path.join(directory, "public"), "global.css");
      await this.copyTemplateFile(path.join(directory, "src"), "App.svelte");
      await this.copyTemplateFile(path.join(directory, "src"), "app.js");

      await this.deleteFile(path.resolve(directory, "src"), "index.html");
      await this.deleteFile(path.resolve(directory, "src"), "index.css");

      await this.updateFileByLine(
        path.resolve(directory, "src", "index.js"),
        (line) => {
          if (line.includes("mainWindow.loadFile"))
            return '  mainWindow.loadFile(path.join(__dirname, "../public/index.html"));';
          return line;
        }
      );
    });
  };
}

export default new SvelteTemplate();
