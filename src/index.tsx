import { Render } from "./render";
import * as React from "react";
import { createRoot } from "react-dom/client";

import { startUI } from "./ui";
import "regenerator-runtime/runtime";

import { startInput } from "./input";
import { updateCamera } from "./camera";
import { updateAgent } from "./movement";
import { sendUpdate, sendBitmapUpdate } from "./client";
import { getState } from "./state";
import render from "./gl";
import { renderGrid } from "./canvasRender";

// console.log(gallery);
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

let size = 500;

let data = new Float32Array(size * size).map((_, i) => {
  // if (i % 4 == 0) return 0;
  return i / (size * size * 2) + 0.1 * Math.random();
});
window.data = data;

let lasttick = Date.now();
function tick() {
  let state = getState();
  let { me, agents } = state;

  let elapsedMillis = Date.now() - lasttick;
  let millisPerTick = 1000 / 60;
  let elapsedTicks = elapsedMillis / millisPerTick;

  const cellSize = 30;
  let pos = me.pos;

  const H = 2.0; // This is the same value as defined in your shader code
  const aspect = window.innerWidth / window.innerHeight;
  const cam = [
    state.camera.x * (aspect < 1.0 ? aspect : 1),
    -state.camera.y / (aspect >= 1.0 ? aspect : 1),
  ];

  const uv = [
    pos.x + cam[0] / window.innerWidth - 0.5,
    pos.y + cam[1] / window.innerHeight - 0.5,
  ];

  const uIso = [uv[0] / H - uv[1], uv[0] / H + uv[1]];
  const transformedUIso = [uIso[1], -uIso[0]];

  let cX = Math.round(transformedUIso[0] / cellSize + size / 2);
  let cY = Math.round(transformedUIso[1] / cellSize + size / 2);

  let index = cX + cY * size;

  index = (index + data.length) % data.length;
  // data[index] = 1.0;
  sendBitmapUpdate(index, 1.0);

  // data = data.map((x) => x * 0.999);
  let meServer = state.agents.find((a) => a.uuid == state?.me.uuid)!;
  if (meServer) {
    state.me = meServer;
  }
  state.me = updateAgent(me, elapsedTicks);
  state.agents = agents.map((agent) => updateAgent(agent, elapsedTicks));

  // debug.innerHTML = state.tick;
  updateCamera(elapsedTicks);
  if (i % 10 == 0) {
    sendUpdate();
  }
  renderGrid();
  render(state.camera, cellSize, data);
  i++;

  lasttick = Date.now();
}
