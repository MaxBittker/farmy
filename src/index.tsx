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

let size = 1000;

let data = new Float32Array(size * size).map((_, i) => {
  // if (i % 4 == 0) return 0;
  return i / (size * size * 2) + 0.1 * Math.random();
});

let lasttick = Date.now();
function tick() {
  let state = getState();
  let { me, agents } = state;

  let elapsedMillis = Date.now() - lasttick;
  let millisPerTick = 1000 / 60;
  let elapsedTicks = elapsedMillis / millisPerTick;

  const cellSize = 10;
  let pos = me.pos;
  let cX = Math.floor(pos.x / cellSize);
  let cY = Math.floor(pos.y / cellSize);
  cX = Math.floor(cX + size / 2);
  cY = Math.floor(cY + size / 2);
  // console.log(cX, cY);
  let index = cX + cY * size;

  index = (index + data.length) % data.length;
  data[index] = 1.0;

  // data = data.map((x) => x * 0.999);
  state.me = updateAgent(me, elapsedTicks);
  state.agents = agents.map((agent) => updateAgent(agent, elapsedTicks));

  // debug.innerHTML = state.tick;
  updateCamera(elapsedTicks);
  if (i % 10 == 0) {
    sendUpdate();
  }
  // renderGrid(state.camera);
  render(state.camera, cellSize, data);
  i++;

  lasttick = Date.now();
}
