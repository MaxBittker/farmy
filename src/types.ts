import * as Vector from "@graph-ts/vector2";
import * as Y from "yjs";

interface AgentLayout {
  uuid: string;
  pos: Matter.Vector;
  target: Matter.Vector;
  heading: number;
  animation: "move" | "stand" | "sit";
  timeIdle: number;
  color?: number;
  word?: string;
}

interface EntityLayout {
  uuid: string;
  pos: Matter.Vector;
  spriteId: string;
  width: number;
  height: number;
}


interface StateLayout {
  me: AgentLayout;
  camera: Matter.Vector;
  frame: Matter.Vector;
  center: Matter.Vector;
  // audios: Source[];
  agents: AgentLayout[];
  entities: Y.Map<EntityLayout>;
}

export type { StateLayout, AgentLayout, EntityLayout };
