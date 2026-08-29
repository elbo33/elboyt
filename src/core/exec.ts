import {spawn} from "node:child_process";

export type ExecResult = {
  stdout: string;
  stderr: string;
};

export function run(command: string, args: string[], cwd: string): Promise<ExecResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: ["ignore", "pipe", "pipe"],
      env: process.env
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      const text = chunk.toString();
      stdout += text;
      process.stdout.write(text);
    });

    child.stderr.on("data", (chunk) => {
      const text = chunk.toString();
      stderr += text;
      process.stderr.write(text);
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve({stdout, stderr});
        return;
      }

      const error = new Error(`${command} ${args.join(" ")} exited with code ${code}`);
      Object.assign(error, {stdout, stderr});
      reject(error);
    });
  });
}
