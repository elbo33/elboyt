import {spawn} from "node:child_process";
import {createReadStream, existsSync} from "node:fs";
import fs from "node:fs/promises";
import {createServer, type IncomingMessage, type ServerResponse} from "node:http";
import path from "node:path";

import {
  FINAL_VIDEO_PATH,
  GENERATED_DIR,
  PROJECT_ROOT,
  READY_MARKER,
  SHORTS_OUT_DIR,
  THUMBNAIL_PATH
} from "../core/config";
import {
  generatedDirHasWork,
  nextProductionStatus,
  productionOverview,
  readReadyMarker
} from "../production/queue";

type JobStatus = "running" | "succeeded" | "failed";
type JobAction = "generateNext" | "voiceoverReady" | "publishReady";

type Job = {
  id: string;
  action: JobAction;
  command: string;
  status: JobStatus;
  startedAt: string;
  finishedAt?: string;
  exitCode?: number | null;
  logs: string[];
};

const STATIC_DIR = path.join(PROJECT_ROOT, "src", "dashboard", "static");
let currentJob: Job | null = null;

const ACTIONS: Record<JobAction, {label: string; args: string[]}> = {
  generateNext: {label: "npm run generate:next", args: ["run", "generate:next"]},
  voiceoverReady: {label: "npm run voiceover:ready", args: ["run", "voiceover:ready"]},
  publishReady: {label: "npm run publish:ready", args: ["run", "publish:ready"]}
};

function sendJson(res: ServerResponse, statusCode: number, value: unknown): void {
  res.writeHead(statusCode, {"Content-Type": "application/json; charset=utf-8"});
  res.end(JSON.stringify(value, null, 2));
}

function sendText(res: ServerResponse, statusCode: number, value: string): void {
  res.writeHead(statusCode, {"Content-Type": "text/plain; charset=utf-8"});
  res.end(value);
}

function contentType(filePath: string): string {
  if (filePath.endsWith(".html")) return "text/html; charset=utf-8";
  if (filePath.endsWith(".css")) return "text/css; charset=utf-8";
  if (filePath.endsWith(".js")) return "text/javascript; charset=utf-8";
  if (filePath.endsWith(".mp4")) return "video/mp4";
  if (filePath.endsWith(".mp3")) return "audio/mpeg";
  if (filePath.endsWith(".png")) return "image/png";
  if (filePath.endsWith(".md")) return "text/markdown; charset=utf-8";
  return "application/octet-stream";
}

async function readBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString("utf8");
}

async function generatedShorts(): Promise<Array<{slug: string; videoUrl: string; scriptUrl: string}>> {
  if (!existsSync(SHORTS_OUT_DIR)) return [];
  const entries = await fs.readdir(SHORTS_OUT_DIR, {withFileTypes: true});
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({
      slug: entry.name,
      videoUrl: `/generated/shorts/${entry.name}/${entry.name}.mp4`,
      scriptUrl: `/generated/shorts/${entry.name}/script.md`
    }));
}

async function statusPayload(): Promise<unknown> {
  const ready = readReadyMarker();
  return {
    status: nextProductionStatus(),
    ready,
    generatedHasWork: generatedDirHasWork(),
    job: currentJob,
    artifacts: {
      video: existsSync(FINAL_VIDEO_PATH) ? "/generated/video.mp4" : null,
      script: existsSync(path.join(GENERATED_DIR, "script.md")) ? "/generated/script.md" : null,
      thumbnail: existsSync(THUMBNAIL_PATH) ? "/generated/thumbnail.png" : null,
      voiceover: existsSync(path.join(GENERATED_DIR, "voiceover.mp3")) ? "/generated/voiceover.mp3" : null,
      readyMarker: existsSync(READY_MARKER) ? "/generated/.ready.json" : null,
      shorts: await generatedShorts()
    },
    overview: productionOverview()
  };
}

function startJob(action: JobAction): Job {
  if (currentJob?.status === "running") {
    throw new Error(`A job is already running: ${currentJob.command}`);
  }

  const selected = ACTIONS[action];
  const job: Job = {
    id: `${Date.now()}`,
    action,
    command: selected.label,
    status: "running",
    startedAt: new Date().toISOString(),
    logs: []
  };
  currentJob = job;

  const child = spawn("npm", selected.args, {cwd: PROJECT_ROOT, stdio: ["ignore", "pipe", "pipe"]});
  const append = (chunk: Buffer) => {
    const text = chunk.toString();
    job.logs.push(...text.split(/\r?\n/).filter(Boolean));
    if (job.logs.length > 500) job.logs.splice(0, job.logs.length - 500);
  };
  child.stdout.on("data", append);
  child.stderr.on("data", append);
  child.on("error", (error) => {
    job.status = "failed";
    job.finishedAt = new Date().toISOString();
    job.logs.push(error.message);
  });
  child.on("close", (code) => {
    job.exitCode = code;
    job.status = code === 0 ? "succeeded" : "failed";
    job.finishedAt = new Date().toISOString();
  });

  return job;
}

function safePath(root: string, requestPath: string): string | null {
  const decoded = decodeURIComponent(requestPath);
  const full = path.resolve(root, decoded.replace(/^\/+/, ""));
  return full.startsWith(root) ? full : null;
}

async function serveFile(res: ServerResponse, root: string, requestPath: string): Promise<void> {
  const filePath = safePath(root, requestPath);
  if (!filePath || !existsSync(filePath)) {
    sendText(res, 404, "Not found");
    return;
  }
  res.writeHead(200, {"Content-Type": contentType(filePath)});
  createReadStream(filePath).pipe(res);
}

async function handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);

  if (req.method === "GET" && url.pathname === "/api/status") {
    sendJson(res, 200, await statusPayload());
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/job") {
    sendJson(res, 200, currentJob);
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/jobs") {
    const body = JSON.parse((await readBody(req)) || "{}") as {action?: JobAction};
    if (!body.action || !(body.action in ACTIONS)) {
      sendJson(res, 400, {error: "Expected action: generateNext, voiceoverReady, or publishReady."});
      return;
    }
    try {
      sendJson(res, 202, startJob(body.action));
    } catch (error) {
      sendJson(res, 409, {error: error instanceof Error ? error.message : String(error)});
    }
    return;
  }

  if (req.method === "GET" && url.pathname.startsWith("/generated/")) {
    await serveFile(res, GENERATED_DIR, url.pathname.replace(/^\/generated\//, ""));
    return;
  }

  if (req.method === "GET") {
    const rel = url.pathname === "/" ? "index.html" : url.pathname;
    await serveFile(res, STATIC_DIR, rel);
    return;
  }

  sendText(res, 405, "Method not allowed");
}

const port = Number(process.env.DASHBOARD_PORT ?? 4317);
createServer((req, res) => {
  handle(req, res).catch((error) => sendJson(res, 500, {error: error.message}));
}).listen(port, () => {
  console.log(`elboyt dashboard: http://localhost:${port}`);
});
