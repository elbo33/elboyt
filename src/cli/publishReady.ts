import {spawnSync} from "node:child_process";
import path from "node:path";

import {PROJECT_ROOT} from "../core/config";
import {readReadyMarker} from "../production/queue";

function main(): void {
  const ready = readReadyMarker();
  if (!ready) {
    console.error("No generated/.ready.json found. Run npm run generate:next first.");
    process.exit(1);
  }

  const args = [ready.section, ready.type];
  if (ready.stage !== "longform") args.push(ready.stage);

  const result = spawnSync(
    process.execPath,
    [path.join(PROJECT_ROOT, "dist", "cli", "publish.js"), ...args],
    {cwd: PROJECT_ROOT, stdio: "inherit"}
  );
  process.exit(result.status ?? 1);
}

main();
