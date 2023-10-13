import * as React from "react";
import walk from "./../assets/ear_walk.gif";
// import walk from "./../assets/walk1.gif";
// import stand from "./../assets/stand1.gif";
import stand from "./../assets/ear_stand.gif";
import sit from "./../assets/ear_sit.gif";
import spiral from "./../assets/arch.png";
import shadow from "./../assets/arch-shadow.png";
// import flower from "./../assets/flower.png";
// import bubble from "./../assets/bubble.png";
import * as Vector from "@graph-ts/vector2";
import { getState } from "./state";
import { AgentLayout } from "./types";
import { convertTarget } from "./input";
import { useAnimationFrame } from "./useAnimationFrame";

// let zoom = window.innerWidth <= 600 ? 1.0 : 1.0;
// window.addEventListener("resize", () => {
//   zoom = window.innerWidth <= 600 ? 1.0 : 1.0;
// });

// let animations = {
//   stand: flower,
//   move: flower,
//   sit: flower
// };
let animations = {
  stand: stand,
  move: walk,
  sit: sit,
};
function renderAgent(agent: AgentLayout, i: number) {
  let { camera, center, me } = getState();
  if (agent.uuid == me.uuid) {
    agent = me;
  }
  let { pos, animation, heading, color, word } = agent;

  let newsrc = animations[animation] || walk;
  let relPos = Vector.add(Vector.subtract(pos, camera), center);

  return (
    <React.Fragment key={i}>
      {/* {!word && (
        <img
          className="bubble"
          src={bubble}
          style={{
            left: relPos.x,
            top: relPos.y
            // filter: `sepia(1) saturate(2.5) hue-rotate(${color}deg)`,
            // transform: `translate(-50%, -75%)`
          }}
        ></img>
      )} */}
      <h1
        className="speech"
        key={"w" + agent.uuid}
        style={{
          left: relPos.x,
          top: relPos.y,
          // filter: `sepia(1) saturate(2.5) hue-rotate(${color}deg)`,
          // transform: `translate(-50%, -75%)`
        }}
      >
        {word}
      </h1>
      {/* <img
        id="walker"
        src={newsrc}
        key={agent.uuid}
        style={{
          left: relPos.x,
          top: relPos.y,
          filter: `sepia(1) saturate(2.5) hue-rotate(${color}deg)`,
          transform: `translate(-50%, -75%) scaleX(${facing ? -1 : 1})`,
          zIndex: Math.floor(10000 + pos.y),
        }}
      ></img> */}
    </React.Fragment>
  );
}
function Render({ tick }): JSX.Element {
  const { camera, agents, center } = getState();
  const [count, setCount] = React.useState(0);

  useAnimationFrame((deltaTime: number) => {
    // Pass on a function to the setter of the state
    // to make sure we always have the latest state
    tick();
    setCount((prevCount) => (prevCount + deltaTime * 0.01) % 100);
  });

  const cameraPos = Vector.subtract(center, camera);
  // Example to map all cursors in jsx
  return (
    <React.Fragment>
      {/* <div
        id="background"
        style={{
          backgroundPosition: `${cameraPos.x * 0.5}px,${cameraPos.y * 0.5}px `
        }}
      ></div> */}
      {agents.map(renderAgent)}
      {/* <img
        id="spawner"
        className=""
        src={spiral}
        style={{
          transform: `translate(-50%,-50% ) translate(${cameraPos.x}px,${cameraPos.y}px ) `,
        }}
      />
      <img
        id="spawner"
        className="shadow"
        src={shadow}
        style={{
          transform: `translate(-50%,-50% ) translate(${cameraPos.x}px,${cameraPos.y}px ) `,
        }}
      /> */}
    </React.Fragment>
  );
}

export { Render };
