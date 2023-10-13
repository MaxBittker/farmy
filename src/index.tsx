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
    "@assets/AoC_sprites/Animals/*/*/*.{png,jpg,jpeg,PNG,JPEG}",
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
const horseFrames = Object.values(
  import.meta.glob(
    "@assets/AoC_sprites/Units/Horse/Walk/*.{png,jpg,jpeg,PNG,JPEG}",
    {
      eager: true,
      as: "url",
    }
  )
).map((src) => {
  let img = new Image();
  img.src = src;
  img.onload = function () {
    let { width, height } = this;
    img.width = width;
    img.height = height;
  };

  return img;
});
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
    // images.push({ img, src, width, height });
    // }
    // }
  };
  // document.body.appendChild(img);

  // return img;
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

let entities = [];
for (var m = 0; m < 100; m++) {
  let randomNatural = images[Math.floor(Math.random() * images.length)];
  let ent = {
    x: (Math.random() - 0.5) * window.innerWidth,
    y: (Math.random() - 0.5) * window.innerHeight,
    image: randomNatural,
  };
  entities.push(ent);
}
entities.sort((a, b) => a.y - b.y);
function renderGrid(camera: Vector.Vector2, agent: AgentLayout) {
  const squareSize = 100;
  // Calculate the adjusted camera coordinates
  const cameraX = camera.x - canvas.width / 2;
  const cameraY = camera.y - canvas.height / 2;

  // Calculate region to be drawn
  const startX = Math.floor(cameraX / squareSize) - 5;
  const startY = Math.floor(cameraY / squareSize) - 5;
  const endX = Math.ceil((cameraX + canvas.width) / squareSize) + 5;
  const endY = Math.ceil((cameraY + canvas.height) / squareSize) + 5;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#777";
  // let ii = 0;
  let unitY = agent.pos.y;

  entities.forEach((entity) => {
    const x = entity.x - cameraX;
    const y = entity.y - cameraY;
    if (y >= unitY) {
      // console.log(j * squareSize, unitY);
      drawUnit();
      unitY = 10000000;
    }

    ctx.drawImage(
      entity.image.img,
      x,
      y,
      entity.image.width,
      entity.image.height
    );
  });
  // for (let j = startY; j < endY; j++) {
  //   // for (let j = endY; j > startY; j--) {
  //   if ((j + 1) * squareSize >= unitY) {
  //     // console.log(j * squareSize, unitY);
  //     drawUnit();
  //     unitY = 1000000;
  //   }
  //   for (let i = startX; i < endX; i++) {
  //     let index = images.length * 50 + i + j * Math.floor(endX - startX);
  //     const x = i * squareSize - cameraX;
  //     const y = j * squareSize - cameraY;
  //     let iData = images[index % images.length];
  //     if (iData) {
  //       let { img, width, height } = iData;
  //       ctx.drawImage(img, x, y);
  //     }
  //     // ctx.strokeRect(x, y, squareSize, squareSize);
  //     ctx.fillStyle = "#000"; // change fill style back for text
  //     // let ascii = String.fromCharCode(Math.floor(grayValue * 255));
  //     // ctx.fillText(ascii, x + 8, y + fontSize);
  //   }
  // }
  // mePos.

  // console.log(mePos);
  // drawUnit();

  function drawUnit() {
    let animals = Object.values(units);
    frame++;
    let { pos, heading, animation } = agent;

    [animals[5]].forEach((animal, i) => {
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
      let horseImg = frames[frame % frames.length];
      // console.lo;
      if (horseImg) {
        let x = pos.x - cameraX;
        let y = pos.y - cameraY;
        if (flip) {
          ctx.translate(x, y);
          ctx.scale(-1, 1);
          ctx.drawImage(horseImg, -horseImg.width / 2, -horseImg.height / 2);
          ctx.resetTransform();
        } else {
          ctx.drawImage(
            horseImg,
            x - horseImg.width / 2,
            y - horseImg.height / 2
          );
        }
      }
    });
  }
  // let horseImg = horseFrames[frame++ % horseFrames.length];
  // // console.lo;
  // if (horseImg) {
  //   let x = mePos.x - cameraX;
  //   let y = mePos.y - cameraY;
  //   ctx.drawImage(horseImg, x - horseImg.width / 2, y - horseImg.height / 2);
  // }
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

  const cellSize = 10;
  let pos = me.pos;
  let cX = Math.floor(pos.x / cellSize);
  let cY = Math.floor(pos.y / cellSize);
  cX = Math.floor(cX + size / 2);
  cY = Math.floor(cY + size / 2);
  // console.log(cX, cY);
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
  renderGrid(state.camera, state.me);
  render(state.camera, cellSize, data);
  i++;

  lasttick = Date.now();
}
