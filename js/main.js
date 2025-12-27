import { setupGame } from "./common.js";

const params = new URLSearchParams(location.search);
const mode = (params.get("mode") || "multiplication").toLowerCase();

const MODE_PATHS = {
  multiplication: "./modes/multiplication.js",
  addition: "./modes/addition.js",
  expressions: "./modes/expressions.js",
  subtraction: "./modes/subtraction.js",
  division: "./modes/division.js",
  radians_to_degrees: "./modes/radians_to_degrees.js",
  logic: "./modes/logic.js",
  lcm: "./modes/lcm.js",
  gcf: "./modes/gcf.js",
  integers: "./modes/integers.js",
  logarithms: "./modes/logarithms.js",
  factoring: "./modes/factoring.js",
  unitcircle: "./modes/unitcircle.js",
  inverse_trig: "./modes/inverse_trig.js",
  degrees_to_radians: "./modes/degrees_to_radians.js",
  unitcircle_click: "./modes/unitcircle_click.js",
};

async function boot() {
  try {
    const modPath = MODE_PATHS[mode];
    if (!modPath) throw new Error(`Unknown mode "${mode}"`);

    const mod = await import(modPath);
    if (!mod || !mod.default) throw new Error(`Mode "${mode}" missing default export`);

    const cfg = mod.default;
    const uiType = cfg.uiType || 'numpad';

    if (uiType === 'numpad') {
      const { setupGame } = await import('./common.js');
      setupGame(cfg);
    } else if (uiType === 'choice') {
      if (cfg.dynamicChoices) {
        const { setupDynamicChoiceGame } = await import('./choiceDynamicShell.js');
        setupDynamicChoiceGame({ generateQuestion: cfg.generateQuestion });
      } else {
        const { setupChoiceGame } = await import('./choiceShell.js');
        setupChoiceGame(cfg);
      }
    } else if (uiType === 'circle') {
      const { setupCircleGame } = await import('./circleShell.js');
      setupCircleGame(cfg);
    } else {
      throw new Error(`Unknown uiType "${uiType}"`);
    }
  } catch (err) {
    document.querySelector("#question").textContent = "Error: " + err.message;
    console.error(err);
  }
}

boot();
