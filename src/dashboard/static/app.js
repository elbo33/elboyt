const state = {
  data: null,
  poll: null
};

const stages = ["longform", "shorts", "stills"];
const types = ["theory", "exercises", "mistakes", "challenge"];

function $(id) {
  return document.getElementById(id);
}

function title(value) {
  return value.replace(/^\w/, (c) => c.toUpperCase());
}

async function api(path, options) {
  const response = await fetch(path, options);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || `Request failed: ${response.status}`);
  return data;
}

async function refresh() {
  state.data = await api("/api/status");
  render();
}

async function start(action) {
  await api("/api/jobs", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({action})
  });
  await refresh();
}

function currentTarget(data) {
  if (data.status.kind === "ready") return data.status.ready;
  if (data.status.kind === "next") return data.status.target;
  return null;
}

function renderHeader(data) {
  const target = currentTarget(data);
  $("subtitle").textContent = target
    ? `${target.section} / ${target.type} / ${target.stage}`
    : "All tracked stages are complete.";

  if (data.status.kind === "ready") {
    const ready = data.status.ready;
    const hasVoice = Boolean(ready.voiceoverAt);
    $("current-gate").textContent =
      ready.stage === "stills"
        ? "Stills review"
        : hasVoice
          ? "Voiced render review"
          : "Silent visual review";
    $("current-detail").textContent = `${ready.section} / ${ready.type} / ${ready.stage}`;
    return;
  }

  if (data.status.kind === "next") {
    const next = data.status.target;
    $("current-gate").textContent = "Next target";
    $("current-detail").textContent = `${next.sectionName} / ${next.type} / ${next.stage}`;
    return;
  }

  $("current-gate").textContent = "Complete";
  $("current-detail").textContent = "No missing stages found.";
}

function renderButtons(data) {
  const running = data.job && data.job.status === "running";
  const ready = data.ready;
  $("generate-next").disabled = running || Boolean(ready) || data.status.kind !== "next";
  $("voiceover-ready").disabled =
    running || !ready || ready.stage === "stills" || Boolean(ready.voiceoverAt);
  $("publish-ready").disabled =
    running || !ready || (ready.stage !== "stills" && !ready.voiceoverAt);
}

function renderPipeline(data) {
  const ready = data.ready;
  const active =
    data.status.kind === "next"
      ? "generate"
      : ready && ready.stage !== "stills" && !ready.voiceoverAt
        ? "visual"
        : ready && ready.stage !== "stills" && ready.voiceoverAt
          ? "voice"
          : ready && ready.stage === "stills"
            ? "stills"
            : "done";
  const steps = [
    ["queue", "Pick next", "Find first missing section, type, and stage."],
    ["generate", "Render visuals", "Create silent generated output."],
    ["visual", "Visual approval", "Review video frames before using voice tokens."],
    ["voice", "Voice approval", "Add ElevenLabs audio and review again."],
    ["done", "Publish", "Copy approved output into library."]
  ];
  $("pipeline").innerHTML = steps
    .map(([id, name, copy]) => {
      const cls = id === active ? "active" : active === "done" ? "done" : "";
      return `<div class="pipe-step ${cls}"><strong>${name}</strong><span>${copy}</span></div>`;
    })
    .join("");
}

function renderArtifacts(data) {
  const a = data.artifacts;
  const links = [
    a.script ? `<a href="${a.script}" target="_blank">script.md</a>` : "",
    a.thumbnail ? `<a href="${a.thumbnail}" target="_blank">thumbnail.png</a>` : "",
    a.voiceover ? `<a href="${a.voiceover}" target="_blank">voiceover.mp3</a>` : "",
    a.readyMarker ? `<a href="${a.readyMarker}" target="_blank">.ready.json</a>` : ""
  ].filter(Boolean);

  const video = a.video
    ? `<video controls src="${a.video}"></video>`
    : `<p class="empty">No generated long-form video staged.</p>`;

  const shorts = a.shorts.length
    ? `<div class="short-grid">${a.shorts
        .map(
          (short) =>
            `<div><video controls src="${short.videoUrl}"></video><a href="${short.scriptUrl}" target="_blank">${short.slug}</a></div>`
        )
        .join("")}</div>`
    : "";

  $("artifacts").innerHTML =
    `${video}${shorts}<div class="artifact-links">${links.join("") || "No generated artifacts."}</div>`;
}

function renderJob(data) {
  const job = data.job;
  if (!job) {
    $("job-log").textContent = "No job running.";
    return;
  }
  const head = `${job.command} - ${job.status}` + (job.exitCode !== undefined ? ` (${job.exitCode})` : "");
  $("job-log").textContent = [head, "", ...job.logs].join("\n");
}

function stageDot(section, type, stage, target) {
  const cls = stage.complete
    ? "done"
    : target && target.section === section && target.type === type && target.stage === stage.stage
      ? "next"
      : "";
  return `<span class="dot ${cls}" title="${type} ${stage.stage}"></span>`;
}

function renderProgress(data) {
  const target = data.status.kind === "next" ? data.status.target : null;
  const header = types.map((type) => `<th colspan="3">${title(type)}</th>`).join("");
  const sub = types.map(() => stages.map((stage) => `<th class="stage-cell">${stage[0].toUpperCase()}</th>`).join("")).join("");
  const rows = data.overview
    .map((section) => {
      const cells = section.episodes
        .map((episode) =>
          episode.stages
            .map((stage) => `<td class="stage-cell">${stageDot(section.section, episode.type, stage, target)}</td>`)
            .join("")
        )
        .join("");
      return `<tr><td class="section-name">${section.sectionName}<br><span class="label">${section.section}</span></td>${cells}</tr>`;
    })
    .join("");
  $("progress").innerHTML = `<table><thead><tr><th>Section</th>${header}</tr><tr><th></th>${sub}</tr></thead><tbody>${rows}</tbody></table>`;
}

function render() {
  const data = state.data;
  renderHeader(data);
  renderButtons(data);
  renderPipeline(data);
  renderArtifacts(data);
  renderJob(data);
  renderProgress(data);
}

$("refresh").addEventListener("click", refresh);
$("generate-next").addEventListener("click", () => start("generateNext").catch((error) => alert(error.message)));
$("voiceover-ready").addEventListener("click", () => start("voiceoverReady").catch((error) => alert(error.message)));
$("publish-ready").addEventListener("click", () => start("publishReady").catch((error) => alert(error.message)));

refresh().catch((error) => {
  $("current-gate").textContent = "Dashboard error";
  $("current-detail").textContent = error.message;
});

state.poll = window.setInterval(() => {
  refresh().catch(() => undefined);
}, 3000);
