import { Render } from "./render";
import * as React from "react";
import ReactDOM from "react-dom";

import { startUI } from "./ui";
import "regenerator-runtime/runtime";

import { startInput } from "./input";
import { updateCamera } from "./camera";
import { updateAgent } from "./movement";
import { sendUpdate } from "./client";
import { getState } from "./state";

startInput();
startUI();
let i = 0;

const rootElement = document.getElementById("window");
ReactDOM.render(
  <React.StrictMode>
    <Render tick={tick} />
  </React.StrictMode>,
  rootElement
);

// // let debug = document.getElementById("debug");

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

  i++;

  lasttick = Date.now();
}
