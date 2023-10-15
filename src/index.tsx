import { Render } from "./render";
import * as React from "react";
import { createRoot } from "react-dom/client";
import * as Vector from "@graph-ts/vector2";

import { startUI } from "./ui";
import "regenerator-runtime/runtime";

import { startInput } from "./input";
import { updateCamera } from "./camera";
import { updateAgent } from "./movement";
import { sendUpdate, sendBitmapUpdate } from "./client";
import { getState } from "./state";
import render from "./gl";
import { AgentLayout } from "./types";

const gallery = Object.values(
  import.meta.glob("@assets/AoC_sprites/Natural/*.{png,jpg,jpeg,PNG,JPEG}", {
    eager: true,
    as: "url",
  })
);

let allFrames = Object.values(
  import.meta.glob(
    // "@assets/AoC_sprites/Animals/*/*/*.{png,jpg,jpeg,PNG,JPEG}",
    "@assets/AoC_sprites/Animals/Standard/*/*.{png,jpg,jpeg,PNG,JPEG}",
    {
      eager: true,
      as: "url",
    }
  )
);
let units = {};
allFrames.forEach((src) => {
  // console.log(src);
  let parts = src.split("/").slice(4);
  let unit = parts[0];
  let mode = parts[1];
  let url = parts[2];
  if (parts[3]) {
    // console.log(parts[3]);
  }
  // console.log(src)
  if (!units[unit]) {
    units[unit] = {};
  }
  if (!units[unit][mode]) {
    units[unit][mode] = [];
  }

  let img = new Image();
  img.src = src;
  img.onload = function () {
    let { width, height } = this;
    img.width = width;
    img.height = height;
  };
  units[unit][mode].push(img);
});
console.log(units);

// console.log(horseFrames);
let images = [];

gallery.forEach((src) => {
  let img = new Image();
  let newObj = { img, src };
  images.push(newObj);
  img.src = src;
  img.onload = function () {
    let { width, height } = this;
    // if (width < 150) {
    // if (src.toLowerCase().indexOf("tree") > -1) {
    newObj.width = width;
    newObj.height = height;
  };
});

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

let canvas = document.getElementById("canvas2") as HTMLCanvasElement;
let ctx = canvas.getContext("2d")!;
// ctx.imageSmoothingEnabled = false;

// Set canvas to full screen
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let frame = 0;

let entities: EntLayout[] = [];

interface EntLayout {
  pos: Matter.Vector;
  image: {
    img: HTMLImageElement;
    width?: number;
    height?: number;
  };
}

for (var m = 0; m < 1000; m++) {
  let randomNatural = images[Math.floor(Math.random() * images.length)];
  let ent = {
    pos: {
      x: (Math.random() - 0.5) * window.innerWidth * 3,
      y: (Math.random() - 0.5) * window.innerHeight * 3,
    },
    image: randomNatural,
  };
  entities.push(ent);
}
entities.sort((a, b) => a.y - b.y);

function DrawEntity(entity) {
  let camera = getState().camera;
  const cameraX = camera.x - canvas.width / 2;
  const cameraY = camera.y - canvas.height / 2;
  let w = entity.image.width;
  let h = entity.image.height;

  const x = entity.pos.x - cameraX;
  const y = entity.pos.y - cameraY;

  //check if sprite is on screen:
  if (
    x - w / 2 > canvas.width ||
    y - h > canvas.height ||
    x + entity.image.width < 0 ||
    y + entity.image.height < 0
  ) {
    return;
  }

  ctx.drawImage(entity.image.img, x - w / 2, y - h);

  ctx.fillStyle = "red";
  ctx.fillRect(x, y, 2, 2);
}
function drawUnit(agent: AgentLayout) {
  let camera = getState().camera;
  const cameraX = camera.x - canvas.width / 2;
  const cameraY = camera.y - canvas.height / 2;

  let animals = Object.values(units);
  frame++;
  let { pos, heading, animation } = agent;

  animals.forEach((animal, i) => {
    // console.log(animal);
    let angle = heading;
    let flip = angle > 4;
    if (angle > 4) {
      angle = 4 - (angle - 4);
    }

    let frames = [];
    if (animation == "move") {
      frames = animal["Walk"];
    } else {
      frames = animal["Stand"] || animal["Stand Ground"];
    }
    let nFrames = frames.length;
    let framePerDir = nFrames / 5;
    let offset = angle * framePerDir;
    frames = frames.slice(offset, offset + framePerDir);

    // console.log(standFrames.length);
    let img = frames[(frame >> 2) % frames.length];
    // console.lo;
    if (img) {
      let x = pos.x - cameraX;
      let y = pos.y - cameraY;
      if (flip) {
        ctx.translate(x, y);
        ctx.scale(-1, 1);
        ctx.drawImage(img, -img.width / 2, -img.height);
        ctx.resetTransform();
      } else {
        ctx.drawImage(img, x - img.width / 2, y - img.height);
      }
      ctx.fillStyle = "blue";
      ctx.fillRect(x, y, 2, 2);
    }
  });
}

function renderGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  let state = getState();
  let { agents, me } = state;

  let drawable = [...entities, ...agents, me];
  drawable.sort((a, b) => {
    let aY = a.pos.y;
    let bY = b.pos.y;

    return aY - bY;
  });
  drawable.forEach((drawable) => {
    if (drawable.image) {
      DrawEntity(drawable);
    } else {
      drawUnit(drawable);
    }
  });
}

let size = 1000;

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
  const aspect = canvas.width / canvas.height;
  const cam = [
    state.camera.x * (aspect < 1.0 ? aspect : 1),
    -state.camera.y / (aspect >= 1.0 ? aspect : 1),
  ];

  const uv = [
    pos.x + cam[0] / canvas.width - 0.5,
    pos.y + cam[1] / canvas.height - 0.5,
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
