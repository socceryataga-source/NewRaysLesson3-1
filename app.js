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

  function escapeHtml(value = "") {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function renderHome() {
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
              <div><strong>Ask in English.</strong><br>If you get stuck, Full Picture has a translation helper.</div>
            </div>
          </div>
        </section>

        <div class="footer-note">Designed for classroom pair work</div>
      </div>
    `;

    document.querySelectorAll("[data-set][data-role]").forEach(btn => {
      btn.addEventListener("click", () => {
        renderViewer(Number(btn.dataset.set), btn.dataset.role);
      });
    });
  }

  function translationPanelHtml() {
    if (!cfg.translation?.enabled) return "";

    const maxChars = Number(cfg.translation.maxChars || 120);
    const helperText = escapeHtml(cfg.translation.helperText || "Type a short Japanese phrase.");
    const placeholder = escapeHtml(cfg.translation.placeholder || "日本語を入力");

    return `
      <section class="translation-panel" aria-label="Japanese to English translation helper">
        <div class="translation-top">
          <div class="translation-title">Need help? Japanese → English</div>
          <div class="translation-hint">${helperText}</div>
        </div>

        <div class="translation-row">
          <textarea
            id="translationInput"
            class="translation-input"
            maxlength="${maxChars}"
            placeholder="${placeholder}"
            aria-label="Japanese text to translate"
          ></textarea>
          <button id="translateBtn" class="translate-btn">Translate</button>
        </div>

        <div id="translationResultWrap" class="translation-result-wrap">
          <div id="translationResult" class="translation-result"></div>
          <button id="copyTranslationBtn" class="copy-btn">Copy</button>
        </div>

        <div id="translationStatus" class="translation-status"></div>
      </section>
    `;
  }

  function renderViewer(setId, role) {
    const set = getEnabledSets().find(s => s.id === setId);
    if (!set) return renderHome();

    const isFull = role === "full";
    const imagePath = isFull ? set.full : set.answer;
    const roleLabel = isFull ? "Full Picture" : "Answer";

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
        </section>

        ${isFull ? translationPanelHtml() : ""}
      </div>
    `;

    const img = document.getElementById("activityImage");
    img.addEventListener("error", () => {
      document.getElementById("imageStage").innerHTML = `
        <div class="image-error">
          <strong>Image not found.</strong><br><br>
          Upload the image to:<br>
          <code>${escapeHtml(imagePath)}</code>
        </div>
      `;
    });

    document.getElementById("homeBtn").addEventListener("click", () => {
      history.pushState(null, "", location.pathname + location.search);
      renderHome();
    });

    document.getElementById("fullscreenBtn").addEventListener("click", async () => {
      const stage = document.getElementById("imageStage");
      try {
        if (!document.fullscreenElement) await stage.requestFullscreen();
        else await document.exitFullscreen();
      } catch (_) {}
    });

    if (isFull && cfg.translation?.enabled) setupTranslation();
  }

  function setupTranslation() {
    const input = document.getElementById("translationInput");
    const btn = document.getElementById("translateBtn");
    const resultWrap = document.getElementById("translationResultWrap");
    const result = document.getElementById("translationResult");
    const status = document.getElementById("translationStatus");
    const copyBtn = document.getElementById("copyTranslationBtn");

    async function translate() {
      const text = input.value.trim();
      if (!text) {
        status.textContent = "日本語を入力してください。";
        status.className = "translation-status error";
        resultWrap.classList.remove("show");
        return;
      }

      if (!cfg.translationEndpoint) {
        status.textContent = "translationEndpoint が未設定です。config.js に Worker URL を設定してください。";
        status.className = "translation-status error";
        return;
      }

      btn.disabled = true;
      btn.textContent = "Translating…";
      status.textContent = "";
      status.className = "translation-status";

      try {
        const response = await fetch(cfg.translationEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text })
        });

        let data = {};
        try { data = await response.json(); } catch (_) {}

        if (!response.ok) {
          throw new Error(data.error || `Translation failed (${response.status})`);
        }

        if (!data.translation) throw new Error("No translation was returned.");

        result.textContent = data.translation;
        resultWrap.classList.add("show");
        status.textContent = "English translation";
      } catch (err) {
        resultWrap.classList.remove("show");
        status.textContent = `翻訳できませんでした: ${err.message}`;
        status.className = "translation-status error";
      } finally {
        btn.disabled = false;
        btn.textContent = "Translate";
      }
    }

    btn.addEventListener("click", translate);

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        translate();
      }
    });

    copyBtn.addEventListener("click", async () => {
      const text = result.textContent.trim();
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        copyBtn.textContent = "Copied";
        setTimeout(() => copyBtn.textContent = "Copy", 1100);
      } catch (_) {
        copyBtn.textContent = "Copy failed";
        setTimeout(() => copyBtn.textContent = "Copy", 1100);
      }
    });
  }

  function loadFromHash() {
    const hash = location.hash.replace(/^#/, "");
    if (!hash) return renderHome();

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
    const params = new URLSearchParams(location.hash.replace(/^#/, ""));
    const setId = Number(params.get("set"));
    const role = params.get("role");

    if (Number.isFinite(setId) && (role === "full" || role === "answer")) {
      renderViewer(setId, role);
    } else {
      renderHome();
    }
  });

  loadFromHash();
})();
