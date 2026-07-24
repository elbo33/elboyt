(function () {
  const panel = document.getElementById("render-log-panel");
  const title = document.getElementById("render-log-title");
  const body = document.getElementById("render-log-body");
  const spinner = document.getElementById("render-log-spinner");
  const closeBtn = document.getElementById("render-log-close");

  closeBtn.addEventListener("click", () => {
    panel.hidden = true;
  });

  function setButtonsDisabled(disabled) {
    document.querySelectorAll("[data-render-one], [data-render-all]").forEach((btn) => {
      btn.disabled = disabled;
    });
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
      if (ok) {
        setTimeout(() => window.location.reload(), 900);
      }
    });
    source.onerror = () => {
      spinner.classList.add("done");
      setButtonsDisabled(false);
      title.textContent = `${label} — connection lost`;
      source.close();
    };
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
})();
