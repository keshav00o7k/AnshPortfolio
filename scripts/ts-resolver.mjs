import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

export async function resolve(specifier, context, defaultResolve) {
  if (specifier.startsWith("@/")) {
    const rel = specifier.slice(2);
    const candidate = path.resolve(process.cwd(), rel);
    for (const ext of [".ts", ".tsx", ".js", ".mjs"]) {
      if (fs.existsSync(candidate + ext)) {
        return {
          url: pathToFileURL(candidate + ext).href,
          shortCircuit: true,
        };
      }
    }
  }

  if (specifier.startsWith("./") || specifier.startsWith("../")) {
    const parentUrl = context.parentURL;
    if (parentUrl && parentUrl.startsWith("file://")) {
      const parentDir = path.dirname(new URL(parentUrl).pathname.replace(/^\/([A-Z]:)/i, "$1"));
      const candidate = path.resolve(parentDir, specifier);
      for (const ext of [".ts", ".tsx", ".js", ".mjs"]) {
        if (fs.existsSync(candidate + ext)) {
          return {
            url: pathToFileURL(candidate + ext).href,
            shortCircuit: true,
          };
        }
      }
    }
  }

  return defaultResolve(specifier, context);
}

