(function () {
  const panel = document.getElementById("render-log-panel");
  if (!panel) return; // this page (e.g. the project list) has no render log / AI panels

  const title = document.getElementById("render-log-title");
  const body = document.getElementById("render-log-body");
  const spinner = document.getElementById("render-log-spinner");
  const closeBtn = document.getElementById("render-log-close");

  closeBtn.addEventListener("click", () => {
    panel.hidden = true;
  });

  function setButtonsDisabled(disabled) {
    document
      .querySelectorAll(
        "[data-render-one], [data-render-all], [data-scene-ai-render-preview], [data-scene-ai-accept]"
      )
      .forEach((btn) => {
        btn.disabled = disabled;
      });
  }

  // Watches an already-started render job (see webapp/jobs.py) in the
  // shared log panel. Used by the render buttons below and by the AI
  // scene-revision flow — a preview render and the real re-render after
  // accepting a proposal are the same kind of job, so they share this UI.
  function watchJob(jobId, label, { onDone } = {}) {
    panel.hidden = false;
    body.textContent = "";
    title.textContent = label;
    spinner.classList.remove("done");
    setButtonsDisabled(true);

    const source = new EventSource(`/api/jobs/${jobId}/stream`);
    source.onmessage = (event) => {
      body.textContent += event.data + "\n";
      body.scrollTop = body.scrollHeight;
    };
    source.addEventListener("done", (event) => {
      spinner.classList.add("done");
      setButtonsDisabled(false);
      const ok = event.data === "ok";
      title.textContent = ok ? `${label} — done` : `${label} — failed`;
      source.close();
      if (onDone) onDone(ok);
    });
    source.onerror = () => {
      spinner.classList.add("done");
      setButtonsDisabled(false);
      title.textContent = `${label} — connection lost`;
      source.close();
      if (onDone) onDone(false);
    };
  }

  async function startRender(slug, scene, lang, label) {
    panel.hidden = false;
    body.textContent = "";
    title.textContent = label;
    spinner.classList.remove("done");
    setButtonsDisabled(true);

    let jobId;
    try {
      const res = await fetch(`/api/projects/${slug}/render`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scene: scene || "all", lang: lang || "all" }),
      });
      if (!res.ok) {
        const detail = await res.json().catch(() => ({}));
        throw new Error(detail.detail || `HTTP ${res.status}`);
      }
      ({ job_id: jobId } = await res.json());
    } catch (err) {
      body.textContent = `Failed to start render: ${err}`;
      spinner.classList.add("done");
      setButtonsDisabled(false);
      return;
    }

    watchJob(jobId, label, {
      onDone: (ok) => {
        if (ok) setTimeout(() => window.location.reload(), 900);
      },
    });
  }

  document.querySelectorAll("[data-render-one]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const { slug, scene, lang } = btn.dataset;
      startRender(slug, scene, lang, `Rendering ${scene} / ${lang}`);
    });
  });

  document.querySelectorAll("[data-render-all]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const { slug, lang } = btn.dataset;
      startRender(slug, null, lang, `Rendering all scenes / ${lang}`);
    });
  });

  // --- AI-assisted scenario section revision (Milestone 5) ---

  document.querySelectorAll("[data-ai-toggle]").forEach((toggleBtn) => {
    const aiPanel = toggleBtn.closest(".ai-revise").querySelector(".ai-panel");
    const { slug, lang, sectionId } = toggleBtn.dataset;

    const feedback = aiPanel.querySelector(".ai-feedback");
    const proposeBtn = aiPanel.querySelector("[data-ai-propose]");
    const status = aiPanel.querySelector(".ai-status");
    const diff = aiPanel.querySelector(".ai-diff");
    const currentBox = aiPanel.querySelector(".ai-diff-current");
    const proposedBox = aiPanel.querySelector(".ai-diff-proposed");
    const errorsBox = aiPanel.querySelector(".ai-errors");
    const acceptActions = aiPanel.querySelector(".ai-accept-actions");
    const acceptBtn = aiPanel.querySelector("[data-ai-accept]");
    const discardBtn = aiPanel.querySelector("[data-ai-discard]");

    toggleBtn.addEventListener("click", () => {
      aiPanel.hidden = !aiPanel.hidden;
    });

    proposeBtn.addEventListener("click", async () => {
      const text = feedback.value.trim();
      if (!text) {
        status.textContent = "Describe what you want changed first.";
        return;
      }
      status.textContent = "Asking the model…";
      proposeBtn.disabled = true;
      diff.hidden = true;
      errorsBox.hidden = true;
      acceptActions.hidden = true;

      try {
        const res = await fetch(
          `/api/projects/${slug}/scenario/${lang}/${sectionId}/revise`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ feedback: text }),
          }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || `HTTP ${res.status}`);

        currentBox.textContent = data.current;
        proposedBox.value = data.proposed;
        diff.hidden = false;
        acceptActions.hidden = false;
        status.textContent = "";

        if (data.errors && data.errors.length) {
          errorsBox.hidden = false;
          errorsBox.textContent = "Won't pass validation as-is: " + data.errors.join("; ");
        }
      } catch (err) {
        status.textContent = `Failed: ${err.message}`;
      } finally {
        proposeBtn.disabled = false;
      }
    });

    acceptBtn.addEventListener("click", async () => {
      acceptBtn.disabled = true;
      status.textContent = "Saving…";
      try {
        const res = await fetch(
          `/api/projects/${slug}/scenario/${lang}/${sectionId}/accept`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ body: proposedBox.value }),
          }
        );
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.detail || `HTTP ${res.status}`);
        window.location.reload();
      } catch (err) {
        status.textContent = `Failed to save: ${err.message}`;
        acceptBtn.disabled = false;
      }
    });

    discardBtn.addEventListener("click", () => {
      diff.hidden = true;
      errorsBox.hidden = true;
      acceptActions.hidden = true;
      feedback.value = "";
      status.textContent = "";
    });
  });

  // --- AI-assisted Manim scene revision (Milestone 6) ---

  document.querySelectorAll("[data-scene-ai-toggle]").forEach((toggleBtn) => {
    const aiPanel = toggleBtn.closest(".ai-revise").querySelector(".ai-panel");
    const { slug, lang, scene } = toggleBtn.dataset;

    const feedback = aiPanel.querySelector(".ai-feedback");
    const proposeBtn = aiPanel.querySelector("[data-scene-ai-propose]");
    const status = aiPanel.querySelector(".ai-status");
    const diff = aiPanel.querySelector(".ai-diff");
    const currentBox = aiPanel.querySelector(".ai-diff-current");
    const proposedBox = aiPanel.querySelector(".ai-diff-proposed");
    const errorsBox = aiPanel.querySelector(".ai-errors");
    const acceptActions = aiPanel.querySelector(".ai-accept-actions");
    const previewBtn = aiPanel.querySelector("[data-scene-ai-render-preview]");
    const acceptBtn = aiPanel.querySelector("[data-scene-ai-accept]");
    const discardBtn = aiPanel.querySelector("[data-scene-ai-discard]");
    const previewBox = aiPanel.querySelector(".ai-preview-video");
    const previewVideo = previewBox.querySelector("video");

    toggleBtn.addEventListener("click", () => {
      aiPanel.hidden = !aiPanel.hidden;
    });

    proposeBtn.addEventListener("click", async () => {
      const text = feedback.value.trim();
      if (!text) {
        status.textContent = "Describe what you want changed first.";
        return;
      }
      status.textContent = "Asking the model…";
      proposeBtn.disabled = true;
      diff.hidden = true;
      errorsBox.hidden = true;
      acceptActions.hidden = true;
      previewBox.hidden = true;

      try {
        const res = await fetch(`/api/projects/${slug}/scenes/${scene}/revise`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lang, feedback: text }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || `HTTP ${res.status}`);

        currentBox.textContent = data.current;
        proposedBox.value = data.proposed;
        diff.hidden = false;
        acceptActions.hidden = false;
        status.textContent = "";

        if (data.errors && data.errors.length) {
          errorsBox.hidden = false;
          errorsBox.textContent = "Won't pass validation as-is: " + data.errors.join("; ");
        }
      } catch (err) {
        status.textContent = `Failed: ${err.message}`;
      } finally {
        proposeBtn.disabled = false;
      }
    });

    previewBtn.addEventListener("click", async () => {
      status.textContent = "Starting preview render…";
      try {
        const res = await fetch(`/api/projects/${slug}/scenes/${scene}/preview`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lang, source: proposedBox.value, quality: "l" }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || `HTTP ${res.status}`);
        status.textContent = "";

        watchJob(data.job_id, `Rendering preview: ${scene} / ${lang}`, {
          onDone: (ok) => {
            if (ok) {
              previewVideo.src = `/media/preview/${slug}/${lang}/${scene}?t=${Date.now()}`;
              previewBox.hidden = false;
            }
          },
        });
      } catch (err) {
        status.textContent = `Failed to start preview: ${err.message}`;
      }
    });

    acceptBtn.addEventListener("click", async () => {
      status.textContent = "Saving…";
      try {
        const res = await fetch(`/api/projects/${slug}/scenes/${scene}/accept`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ source: proposedBox.value }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || `HTTP ${res.status}`);
        status.textContent = "";

        watchJob(data.job_id, `Re-rendering ${scene} (accepted)`, {
          onDone: (ok) => {
            if (ok) setTimeout(() => window.location.reload(), 900);
          },
        });
      } catch (err) {
        status.textContent = `Failed to save: ${err.message}`;
      }
    });

    discardBtn.addEventListener("click", () => {
      diff.hidden = true;
      errorsBox.hidden = true;
      acceptActions.hidden = true;
      previewBox.hidden = true;
      feedback.value = "";
      status.textContent = "";
    });
  });
})();

// --- New project from an idea (Milestone 7) ---

(function () {
  const toggleBtn = document.getElementById("new-project-toggle");
  const form = document.getElementById("new-project-form");
  if (!toggleBtn || !form) return; // only present on the project list page

  const status = form.querySelector(".new-project-status");
  const submitBtn = form.querySelector('button[type="submit"]');

  toggleBtn.addEventListener("click", () => {
    form.hidden = !form.hidden;
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const idea = form.idea.value.trim();
    const languages = form.languages.value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const minutes = Number(form.minutes.value) || 8;

    if (!idea || !languages.length) {
      status.hidden = false;
      status.textContent = "An idea and at least one language are required.";
      return;
    }

    submitBtn.disabled = true;
    status.hidden = false;
    status.textContent = "Generating the project draft — this can take a minute…";

    try {
      const res = await fetch("/api/projects/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea,
          target_length_seconds: minutes * 60,
          languages,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || `HTTP ${res.status}`);

      status.textContent = `Created ${data.slug} — opening it…`;
      window.location.href = `/projects/${data.slug}`;
    } catch (err) {
      status.textContent = `Failed: ${err.message}`;
      submitBtn.disabled = false;
    }
  });
})();
