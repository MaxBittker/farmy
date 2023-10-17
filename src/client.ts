import * as Y from "yjs";
// import { WebsocketProvider } from "y-websocket";
import YPartyKitProvider from "y-partykit/provider";

// console.log(YPartyKitProvider)
import { getState } from "./state";
import { AgentLayout, EntityLayout } from "./types";

import { distance } from "./utils";


const ydoc = new Y.Doc();

const bitmap = ydoc.getMap("bitmap");

bitmap.observe((event) => {
  // console.log(event)
  event.keysChanged.forEach((key) => {
    window.data[key] = 1
  })
});
const roomname = `walky-space-${window.location.pathname}`;
function sendBitmapUpdate(i: number, val: number) {

  bitmap.set(i.toString(), val);
}

const yMapEnts: Y.Map<EntityLayout> = ydoc.getMap("entities");
getState().entities = yMapEnts;
// function sendEntityUpdate(uuid: string) {
//   const { entities } = getState();

//   let ent = entities.get(uuid);

//   yMapEnts.set(uuid, ent);
// }

// function sendEntityDelete(uuid: string) {
//   console.log("deleting: " + uuid);
//   yMapEnts.delete(uuid);
// }





const yProvider = new YPartyKitProvider(
  "localhost:1999",
  roomname,
  ydoc
);

const awareness = yProvider.awareness;
const myYId = awareness.clientID;

// You can observe when a user updates their awareness information
awareness.on("change", (_changes: any) => {
  // todo be more selective
  const newStates = awareness.getStates();
  let me = getState().me;
  let agents = Array.from(newStates.values())
    .map((e) => e.agent)
    .filter((e) => e);
  // .filter((e) => e && e?.uuid !== me?.uuid);

  processAgents(agents);
});

function processAgents(agents: AgentLayout[]) {
  let state = getState();

  let agentsMap: { [uuid: string]: AgentLayout } = {};
  state.agents.forEach((a) => {
    agentsMap[a.uuid] = a;
  });

  state.agents = agents.map((a) => {
    let pos = agentsMap[a?.uuid]?.pos || a?.pos;
    if (distance(a.target, a.pos) < 1) {
      pos = a.pos;
    }
    return {
      ...a,
      pos,
    };
  });
}
let lastJSON = "";
function sendUpdate() {
  let newJSON = JSON.stringify(getState().me);
  if (lastJSON !== newJSON) {
    awareness.setLocalStateField("agent", getState().me);
    lastJSON = newJSON;
  }
}


export { sendUpdate, sendBitmapUpdate };
