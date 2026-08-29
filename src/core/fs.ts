import fs from "node:fs/promises";
import path from "node:path";

export async function resetDir(dir: string): Promise<void> {
  await fs.rm(dir, {recursive: true, force: true});
  await fs.mkdir(dir, {recursive: true});
}

export async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, {recursive: true});
}

export async function writeJson(filePath: string, value: unknown): Promise<void> {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export async function copyFileEnsured(source: string, target: string): Promise<void> {
  await ensureDir(path.dirname(target));
  await fs.copyFile(source, target);
}
