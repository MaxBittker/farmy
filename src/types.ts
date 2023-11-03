// import * as Y from "yjs";
import * as Matter from 'matter-js';

interface AgentLayout {
  uuid: string;
  pos: Matter.Vector;
  target: Matter.Vector;
  heading: number;
  animation: "move" | "stand" | "sit" | "die" | "rot";
  timeIdle: number;
  color?: number;
  word?: string;
  timeOfDeath?: number;
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
  entities: EntityLayout[];
}

interface MessageLayout {
  type: "A" | "E";
  data: { [key: string]: AgentLayout } | { [key: string]: EntityLayout };
}

interface ClientMessageLayout {
  type: "A" | "E";
  data: AgentLayout | EntityLayout;
}

export type { StateLayout, AgentLayout, EntityLayout, MessageLayout, ClientMessageLayout };
