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

let canvas = document.getElementById("canvas") as HTMLCanvasElement;
let ctx = canvas.getContext("2d")!;
// ctx.imageSmoothingEnabled = false;

// Set canvas to full screen
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let gridData = new Array(32)
  .fill()
  .map(() => new Array(32).fill().map(() => Math.random()));

function renderGrid(camera) {
  const squareSize = 35;
  const fontSize = Math.floor(squareSize * 0.35);
  // Calculate the adjusted camera coordinates
  const cameraX = camera.x - canvas.width / 2;
  const cameraY = camera.y - canvas.height / 2;

  // Calculate region to be drawn
  const startX = Math.floor(cameraX / squareSize);
  const startY = Math.floor(cameraY / squareSize);
  const endX = Math.ceil((cameraX + canvas.width) / squareSize);
  const endY = Math.ceil((cameraY + canvas.height) / squareSize);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = fontSize + "px monospace";
  ctx.strokeStyle = "#777";
  const gridSize = gridData.length;
  for (let i = startX; i < endX; i++) {
    for (let j = startY; j < endY; j++) {
      const x = i * squareSize - cameraX;
      const y = j * squareSize - cameraY;

      const wrappedI = ((i % gridSize) + gridSize) % gridSize;
      const wrappedJ = ((j % gridSize) + gridSize) % gridSize;
      const grayValue = gridData[wrappedI][wrappedJ];
      ctx.fillStyle = getColor(grayValue);
      ctx.fillRect(x, y, squareSize, squareSize);

      ctx.strokeRect(x, y, squareSize, squareSize);
      ctx.fillStyle = "#000"; // change fill style back for text
      ctx.fillText(`${wrappedI},${wrappedJ}`, x + 5, y + 20);
      // let ascii = String.fromCharCode(Math.floor(grayValue * 255));
      // ctx.fillText(ascii, x + 8, y + fontSize);
    }
  }
}

function getColor(value) {
  // Define colors for start (0.0), middle (0.5), and end (1.0)
  const color1 = [245, 222, 179];
  const color2 = [213, 255, 0];
  const color3 = [5, 122, 38];

  let r, g, b;

  if (value <= 0.5) {
    // interpolate between color1 and color2
    value *= 2; // scale up to 1
    r = color1[0] * (1 - value) + color2[0] * value;
    g = color1[1] * (1 - value) + color2[1] * value;
    b = color1[2] * (1 - value) + color2[2] * value;
  } else {
    // interpolate between color2 and color3
    value = (value - 0.5) * 2; // scale up to 1
    r = color2[0] * (1 - value) + color3[0] * value;
    g = color2[1] * (1 - value) + color3[1] * value;
    b = color2[2] * (1 - value) + color3[2] * value;
  }

  // Create RGB color value
  return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, 0.5)`;
}

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
  renderGrid(state.camera);

  i++;

  lasttick = Date.now();
}
