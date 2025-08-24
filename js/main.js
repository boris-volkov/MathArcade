import { setupGame } from "./common.js";

const params = new URLSearchParams(location.search);
const mode = (params.get("mode") || "multiplication").toLowerCase();

const MODE_PATHS = {
  multiplication: "./modes/multiplication.js",
  addition: "./modes/addition.js",
  lcm: "./modes/lcm.js",
  gcf: "./modes/gcf.js",
};

async function boot() {
  try {
    const modPath = MODE_PATHS[mode];
    if (!modPath) throw new Error(`Unknown mode "${mode}"`);

    const mod = await import(modPath);
    if (!mod || !mod.default) throw new Error(`Mode "${mode}" missing default export`);

    setupGame(mod.default);
  } catch (err) {
    document.querySelector("h1").textContent = "Error";
    document.querySelector("#question").textContent = err.message;
    console.error(err);
  }
}

boot();
