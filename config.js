/*
  =========================================================
  Visualizing Reverse — EDIT THIS FILE FOR EACH LESSON
  =========================================================

  1) Change lessonLabel to update the title.
     Example: "3-1" -> "3-2"

  2) Turn sets on/off with enabled: true / false.

  3) Put image files in /assets and write their filenames below.

  4) After deploying the Cloudflare Worker, paste its URL into
     translationEndpoint.

  Up to 6 sets are supported.
*/

window.VR_CONFIG = {
  lessonLabel: "3-1",

  // Full Picture images already contain A / B / C / D.
  showQuadrantLabels: false,

  // Paste your deployed Cloudflare Worker URL here.
  // Example:
  // translationEndpoint: "https://visualizing-translate.example.workers.dev",
  translationEndpoint: "",

  translation: {
    enabled: true,
    maxChars: 120,
    helperText: "If you get stuck, type a short Japanese phrase.",
    placeholder: "例：冷蔵庫のドアは開いていますか？"
  },

  sets: [
    { id: 1, enabled: true,  full: "assets/set01_full.png", answer: "assets/set01_answer.png" },
    { id: 2, enabled: true,  full: "assets/set02_full.png", answer: "assets/set02_answer.png" },
    { id: 3, enabled: true,  full: "assets/set03_full.png", answer: "assets/set03_answer.png" },
    { id: 4, enabled: true,  full: "assets/set04_full.png", answer: "assets/set04_answer.png" },
    { id: 5, enabled: false, full: "assets/set05_full.png", answer: "assets/set05_answer.png" },
    { id: 6, enabled: false, full: "assets/set06_full.png", answer: "assets/set06_answer.png" }
  ]
};
