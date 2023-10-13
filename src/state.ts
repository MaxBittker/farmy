import * as Vector from "@graph-ts/vector2";

import { v4 as uuidv4 } from "uuid";
import { StateLayout } from "./types";
import { nrandom, randomVec } from "./utils";
import { atom } from "jotai";


let uuid = uuidv4().slice(0, 8);

let state: StateLayout = {
  me: {
    uuid,
    pos: randomVec(50),
    target: randomVec(50),
    heading: 0,
    animation: "stand",
    timeIdle: 0,
    color: Math.random() * 360,
  },
  camera: { x: 0, y: 0 },
  frame: { x: 0, y: 0 },
  center: { x: 0, y: 0 },
  // audios: [],
  agents: [],
};


function resize() {
  state.frame = { x: window.innerWidth, y: window.innerHeight };
  state.center = Vector.divideScalar(state.frame, 2);
  // console.log("resized!");
}
resize();
window.state = state;
window.addEventListener("resize", resize);
window.setInterval(resize, 2000);
function getState() {
  return state;
}

export { getState };
