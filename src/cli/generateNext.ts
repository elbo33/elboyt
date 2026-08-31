import {spawnSync} from "node:child_process";
import path from "node:path";

import {PROJECT_ROOT} from "../core/config";
import {generatedDirHasWork, nextProductionStatus, publishCommand} from "../production/queue";

function runNode(script: string, args: string[]): never {
  const result = spawnSync(process.execPath, [script, ...args], {
    cwd: PROJECT_ROOT,
    stdio: "inherit"
  });
  process.exit(result.status ?? 1);
}

function main(): void {
  const status = nextProductionStatus();
  if (status.kind === "complete") {
    console.log("All production targets are complete.");
    return;
  }
  if (status.kind === "ready") {
    console.error("generated/ already contains output waiting for review.");
    console.error(`Review it, then publish with: ${publishCommand(status.ready)}`);
    process.exit(1);
  }
  if (generatedDirHasWork()) {
    console.error("generated/ contains scratch files but no .ready.json.");
    console.error("Review or clear generated/ before running generate:next.");
    process.exit(1);
  }

  const t = status.target;
  console.log(`Generating next target: ${t.section} / ${t.type} / ${t.stage}`);
  const args = [t.section, t.type];
  if (t.stage !== "longform") args.push(t.stage);
  runNode(path.join(PROJECT_ROOT, "dist", "cli", "generate.js"), args);
}

main();
