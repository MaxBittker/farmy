import { Render } from "./render";
import * as React from "react";
import { createRoot } from "react-dom/client";

import { startUI } from "./ui";
import "regenerator-runtime/runtime";

import { startInput } from "./input";
import { updateCamera } from "./camera";
import { updateAgent } from "./movement";
import { sendUpdate } from "./client";
import { getState } from "./state";
import render from "./gl";

startInput();
startUI();
let i = 0;

const rootElement = document.getElementById("window");
const root = createRoot(rootElement!); // createRoot(container!) if you use TypeScript

root.render(
  <React.StrictMode>
    <Render tick={tick} />
  </React.StrictMode>
);

// // let debug = document.getElementById("debug");

// ctx.imageSmoothingEnabled = false;

let gridData = new Array(2000)
  .fill(0)
  .map(() => new Array(2000).fill(0).map(() => Math.random() * 0.1));

let data = Float32Array.from(gridData.flat());

let lasttick = Date.now();
function tick() {
  let state = getState();
  let { me, agents } = state;

  let elapsedMillis = Date.now() - lasttick;
  let millisPerTick = 1000 / 60;
  let elapsedTicks = elapsedMillis / millisPerTick;

  state.me = updateAgent(me, elapsedTicks);
  state.agents = agents.map((agent) => updateAgent(agent, elapsedTicks));

  // debug.innerHTML = state.tick;
  updateCamera(elapsedTicks);
  if (i % 10 == 0) {
    sendUpdate();
  }
  // renderGrid(state.camera);
  render(state.camera, data);
  i++;

  lasttick = Date.now();
}
