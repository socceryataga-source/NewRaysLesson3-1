(() => {
  const cfg = window.VR_CONFIG;
  const app = document.getElementById("app");

  if (!cfg || !Array.isArray(cfg.sets)) {
    app.innerHTML = "<p>Configuration error: config.js could not be loaded.</p>";
    return;
  }

  const lessonTitle = `Visualizing Reverse Lesson${cfg.lessonLabel}`;
  document.title = lessonTitle;

  function getEnabledSets() {
    return cfg.sets.filter(set => set.enabled).slice(0, 6);
  }

  function renderHome() {
    history.replaceState(null, "", location.pathname + location.search);

    const sets = getEnabledSets();

    app.innerHTML = `
      <div class="shell">
        <div class="topbar">
          <div class="brand">
            <div class="logo">VR</div>
            <div class="title-group">
              <h1>${lessonTitle}</h1>
              <p>Question • Compare • Identify</p>
            </div>
          </div>
        </div>

        <section class="hero">
          <h2>Choose your set.</h2>
          <p>
            One student opens <strong>Full Picture</strong>. The partner opens
            <strong>Answer</strong>. Ask as many English questions as possible
            and identify the matching picture.
          </p>

          <div class="set-grid">
            ${sets.map(set => `
              <article class="set-card">
                <div class="set-head">
                  <div class="set-number">Set ${set.id}</div>
                  <div class="set-status">Pair work</div>
                </div>
                <div class="role-actions">
                  <button class="role-btn full-btn" data-set="${set.id}" data-role="full">
                    Full Picture
                  </button>
                  <button class="role-btn answer-btn" data-set="${set.id}" data-role="answer">
                    Answer
                  </button>
                </div>
              </article>
            `).join("")}
          </div>

          <div class="instructions">
            <div class="step">
              <div class="step-badge">1</div>
              <div><strong>Do not show your screen.</strong><br>Keep each role's image private.</div>
            </div>
            <div class="step">
              <div class="step-badge">2</div>
              <div><strong>Use questions only.</strong><br>After finishing, return Home and choose the next set.</div>
            </div>
          </div>
        </section>

        <div class="footer-note">Designed for classroom pair work</div>
      </div>
    `;

    document.querySelectorAll("[data-set][data-role]").forEach(btn => {
      btn.addEventListener("click", () => {
        const setId = Number(btn.dataset.set);
        const role = btn.dataset.role;
        renderViewer(setId, role);
      });
    });
  }

  function renderViewer(setId, role) {
    const set = getEnabledSets().find(s => s.id === setId);
    if (!set) {
      renderHome();
      return;
    }

    const isFull = role === "full";
    const imagePath = isFull ? set.full : set.answer;
    const roleLabel = isFull ? "Full Picture" : "Answer";
    const roleClass = isFull ? "full" : "answer";

    history.pushState({ setId, role }, "", `#set=${setId}&role=${role}`);

    app.innerHTML = `
      <div class="shell viewer">
        <div class="viewer-head">
          <div class="viewer-meta">
            <div class="eyebrow">${lessonTitle}</div>
            <h2>Set ${set.id} — ${roleLabel}</h2>
          </div>
          <div class="viewer-actions">
            <button class="utility-btn" id="fullscreenBtn">Full Screen</button>
            <button class="home-btn" id="homeBtn">← Home</button>
          </div>
        </div>

        <section class="image-stage" id="imageStage">
          <img id="activityImage" src="${imagePath}" alt="Set ${set.id} ${roleLabel}">
          ${isFull && cfg.showQuadrantLabels ? `
            <div class="quad-label q-a">A</div>
            <div class="quad-label q-b">B</div>
            <div class="quad-label q-c">C</div>
            <div class="quad-label q-d">D</div>
          ` : ""}
        </section>
      </div>
    `;

    const img = document.getElementById("activityImage");
    img.addEventListener("error", () => {
      document.getElementById("imageStage").innerHTML = `
        <div class="image-error">
          <strong>Image not found.</strong><br><br>
          Upload the image to:<br>
          <code>${imagePath}</code><br><br>
          File names are controlled in <code>config.js</code>.
        </div>
      `;
    });

    document.getElementById("homeBtn").addEventListener("click", renderHome);

    document.getElementById("fullscreenBtn").addEventListener("click", async () => {
      const stage = document.getElementById("imageStage");
      try {
        if (!document.fullscreenElement) {
          await stage.requestFullscreen();
        } else {
          await document.exitFullscreen();
        }
      } catch (_) {}
    });
  }

  function loadFromHash() {
    const hash = location.hash.replace(/^#/, "");
    if (!hash) {
      renderHome();
      return;
    }

    const params = new URLSearchParams(hash);
    const setId = Number(params.get("set"));
    const role = params.get("role");

    if (Number.isFinite(setId) && (role === "full" || role === "answer")) {
      renderViewer(setId, role);
    } else {
      renderHome();
    }
  }

  window.addEventListener("popstate", () => {
    if (location.hash) {
      const params = new URLSearchParams(location.hash.slice(1));
      const setId = Number(params.get("set"));
      const role = params.get("role");
      if (role === "full" || role === "answer") {
        renderViewer(setId, role);
        return;
      }
    }
    renderHome();
  });

  loadFromHash();
})();
