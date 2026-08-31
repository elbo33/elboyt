import {generateCommand, nextProductionStatus, publishCommand} from "../production/queue";

function main(): void {
  const status = nextProductionStatus();
  if (status.kind === "complete") {
    console.log("All production targets are complete.");
    return;
  }

  if (status.kind === "ready") {
    const r = status.ready;
    console.log("Generated output is waiting for review.");
    console.log("");
    console.log(`section: ${r.section}`);
    console.log(`type:    ${r.type}`);
    console.log(`stage:   ${r.stage}`);
    if (r.at) console.log(`ready:   ${r.at}`);
    console.log("");
    console.log(`Review generated/, then publish with: ${publishCommand(r)}`);
    return;
  }

  const t = status.target;
  console.log("Next production target:");
  console.log("");
  console.log(`section: ${t.section}`);
  console.log(`title:   ${t.sectionName}`);
  console.log(`type:    ${t.type}`);
  console.log(`stage:   ${t.stage}`);
  console.log("");
  console.log(`Generate with: ${generateCommand(t)}`);
}

main();
