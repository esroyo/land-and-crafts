// ../denoland/deno-vite-plugin/src/resolver.ts
import { execFile } from "node:child_process";
import process from "node:process";
import path from "node:path";
import { fileURLToPath } from "node:url";

// ../denoland/deno-vite-plugin/src/utils.ts
import child_process from "node:child_process";
async function execAsync(cmd, options) {
  return await new Promise(
    (resolve, reject) => child_process.exec(cmd, options, (error, stdout, stderr) => {
      if (error) reject(error);
      else resolve({ stdout, stderr });
    })
  );
}

// ../denoland/deno-vite-plugin/src/resolver.ts
function isResolveError(info) {
  return "error" in info && typeof info.error === "string";
}
var checkedDenoInstall = false;
var DENO_BINARY = process.platform === "win32" ? "deno.exe" : "deno";
async function resolveDeno(id, cwd) {
  if (id.startsWith("\0")) return null;
  if (!checkedDenoInstall) {
    try {
      await execAsync(`${DENO_BINARY} --version`, { cwd });
      checkedDenoInstall = true;
    } catch {
      throw new Error(
        `Deno binary could not be found. Install Deno to resolve this error.`
      );
    }
  }
  const output = await new Promise((resolve, reject) => {
    execFile(DENO_BINARY, ["info", "--json", id], { cwd }, (error, stdout) => {
      if (error) {
        if (String(error).includes("Integrity check failed")) {
          reject(error);
        } else {
          resolve(null);
        }
      } else resolve(stdout);
    });
  });
  if (output === null) return null;
  const json = JSON.parse(output);
  const actualId = json.roots[0];
  const redirected = json.redirects[actualId] ?? actualId;
  const mod = json.modules.find((info) => info.specifier === redirected);
  if (mod === void 0) return null;
  if (isResolveError(mod)) {
    return null;
  }
  if (mod.kind === "esm" || mod.kind === "asserted") {
    return {
      id: mod.local,
      kind: mod.kind,
      loader: mod.mediaType,
      dependencies: "dependencies" in mod ? mod.dependencies : []
    };
  } else if (mod.kind === "npm") {
    return {
      id: mod.npmPackage,
      kind: mod.kind,
      loader: null,
      dependencies: []
    };
  } else if (mod.kind === "external") {
    return null;
  }
  throw new Error(`Unsupported: ${JSON.stringify(mod, null, 2)}`);
}
async function resolveViteSpecifier(id, cache, posixRoot, importer) {
  const root = path.normalize(posixRoot);
  if (!id.startsWith(".") && !id.startsWith("/")) {
    try {
      id = import.meta.resolve(id);
    } catch {
    }
  }
  if (importer && isDenoSpecifier(importer)) {
    const { resolved: parent } = parseDenoSpecifier(importer);
    const cached = cache.get(parent);
    if (cached === void 0) return;
    const found = cached.dependencies.find((dep) => dep.specifier === id);
    if (found === void 0) return;
    id = found.code.specifier;
    if (id.startsWith("file://")) {
      return fileURLToPath(id);
    }
  }
  const resolved = cache.get(id) ?? await resolveDeno(id, root);
  if (resolved === null) return;
  if (resolved.kind === "npm") {
    return null;
  }
  cache.set(resolved.id, resolved);
  if (resolved.loader === null || resolved.id.startsWith(path.resolve(root)) && !path.relative(root, resolved.id).startsWith(".")) {
    return resolved.id;
  }
  return toDenoSpecifier(resolved.loader, id, resolved.id);
}
function isDenoSpecifier(str) {
  return str.startsWith("\0deno");
}
function toDenoSpecifier(loader, id, resolved) {
  return `\0deno::${loader}::${id}::${resolved}`;
}
function parseDenoSpecifier(spec) {
  const [_, loader, id, posixPath] = spec.split("::");
  const resolved = path.normalize(posixPath);
  return { loader, id, resolved };
}

// ../denoland/deno-vite-plugin/src/prefixPlugin.ts
import process2 from "node:process";
import path2 from "node:path";
function denoPrefixPlugin(cache) {
  let root = process2.cwd();
  return {
    name: "deno:prefix",
    enforce: "pre",
    configResolved(config) {
      root = path2.normalize(config.root);
    },
    async resolveId(id, importer) {
      if (id.startsWith("npm:")) {
        const resolved = await resolveDeno(id, root);
        if (resolved === null) return;
        const actual = resolved.id.slice(0, resolved.id.indexOf("@"));
        const result = await this.resolve(actual);
        return result ?? actual;
      } else if (id.startsWith("http:") || id.startsWith("https:")) {
        return await resolveViteSpecifier(id, cache, root, importer);
      }
    }
  };
}

// ../denoland/deno-vite-plugin/src/resolvePlugin.ts
import { transform } from "esbuild";
import * as fsp from "node:fs/promises";
import process3 from "node:process";
import path3 from "node:path";
function denoPlugin(cache) {
  let root = process3.cwd();
  return {
    name: "deno",
    configResolved(config) {
      root = path3.normalize(config.root);
    },
    async resolveId(id, importer) {
      if (isDenoSpecifier(id)) return;
      return await resolveViteSpecifier(id, cache, root, importer);
    },
    async load(id) {
      if (!isDenoSpecifier(id)) return;
      const { loader, resolved } = parseDenoSpecifier(id);
      const content = await fsp.readFile(resolved, "utf-8");
      if (loader === "JavaScript") return content;
      if (loader === "Json") {
        return `export default ${content}`;
      }
      const result = await transform(content, {
        format: "esm",
        loader: mediaTypeToLoader(loader),
        logLevel: "debug"
      });
      const map = result.map === "" ? null : result.map;
      return {
        code: result.code,
        map
      };
    }
  };
}
function mediaTypeToLoader(media) {
  switch (media) {
    case "JSX":
      return "jsx";
    case "JavaScript":
      return "js";
    case "Json":
      return "json";
    case "TSX":
      return "tsx";
    case "TypeScript":
      return "ts";
  }
}

// ../denoland/deno-vite-plugin/src/index.ts
function deno() {
  const cache = /* @__PURE__ */ new Map();
  return [denoPrefixPlugin(cache), denoPlugin(cache)];
}
export {
  deno as default
};
