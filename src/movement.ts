import * as Vector from "@graph-ts/vector2";
import { AgentLayout } from "./types";

let topSpeed = 2;
let epsilon = 1;
let maxTurnAngle = Math.PI / 8; // Maximum change in angle per frame
function updateAgent(agent: AgentLayout, elapsed: number) {
  agent.timeIdle += elapsed;
  const { target, pos } = agent;
  let velocity = { x: 0, y: 0 };
  let heading = Vector.normal(Vector.subtract(target, pos));
  let distance = Vector.length(Vector.subtract(pos, target));
  let speed = Math.min(topSpeed, distance);
  if (distance < epsilon) {
    speed = 0;
  }
  let dT = Math.min(speed * elapsed, distance);
  velocity = Vector.multiplyScalar(heading, dT);

  agent.pos = Vector.add(pos, velocity);
  // this might not be consistent

  let angle = Vector.angle(heading);
  angle = Math.round((8 * angle) / (Math.PI * 2));
  angle = (angle + 8 - 2) % 8;

  // Enforce a minimum turn radius (maximum change in angle per frame)
  let angleDiff = ((angle - agent.heading) + Math.PI * 2) % (Math.PI * 2);
  if (angleDiff > Math.PI) {
    angleDiff -= Math.PI * 2;
  }
  if (angleDiff > maxTurnAngle) {
    angle = agent.heading + maxTurnAngle;
  } else if (angleDiff < -maxTurnAngle) {
    angle = agent.heading - maxTurnAngle;
  }

  if (speed > 0.1) {
    agent.heading = angle;
  }

  if (agent.timeOfDeath) return agent;
  agent.animation = "stand";
  if (Math.abs(velocity.x) > 0.02 || Math.abs(velocity.y) > 0.02) {
    agent.animation = "move";
    agent.timeIdle = 0;
  }
  if (agent.timeIdle > 3000) {
    agent.animation = "sit";
  }
  return agent;
}

export { updateAgent, topSpeed };
