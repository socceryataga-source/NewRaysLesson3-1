/*
  =========================================================
  Visualizing Reverse — EDIT ONLY THIS FILE FOR EACH LESSON
  =========================================================

  1) Change lessonLabel to update the title.
     Example: "3-1" -> "3-2"

  2) Turn sets on/off with enabled: true / false.

  3) Put image files in /assets and write their filenames below.

  Up to 6 sets are supported by the interface.
*/

window.VR_CONFIG = {
  lessonLabel: "3-1",

  // The Full Picture images already contain A / B / C / D labels,
  // so no additional labels are overlaid by the website.
  showQuadrantLabels: false,

  sets: [
    {
      id: 1,
      enabled: true,
      full: "assets/set01_full.png",
      answer: "assets/set01_answer.png"
    },
    {
      id: 2,
      enabled: true,
      full: "assets/set02_full.png",
      answer: "assets/set02_answer.png"
    },
    {
      id: 3,
      enabled: true,
      full: "assets/set03_full.png",
      answer: "assets/set03_answer.png"
    },
    {
      id: 4,
      enabled: true,
      full: "assets/set04_full.png",
      answer: "assets/set04_answer.png"
    },
    {
      id: 5,
      enabled: false,
      full: "assets/set05_full.png",
      answer: "assets/set05_answer.png"
    },
    {
      id: 6,
      enabled: false,
      full: "assets/set06_full.png",
      answer: "assets/set06_answer.png"
    }
  ]
};
