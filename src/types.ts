import * as Vector from "@graph-ts/vector2";

interface AgentLayout {
  uuid: string;
  pos: Matter.Vector;
  target: Matter.Vector;
  facing: Boolean;
  animation: "move" | "stand" | "sit";
  timeIdle: number;
  color?: number;
  word?: string;
}

interface StateLayout {
  me: AgentLayout;
  camera: Matter.Vector;
  frame: Matter.Vector;
  center: Matter.Vector;
  // audios: Source[];
  agents: AgentLayout[];
}

export { StateLayout, AgentLayout };
