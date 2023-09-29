import * as Y from "yjs";
// import { WebsocketProvider } from "y-websocket";
import YPartyKitProvider from "y-partykit/provider";

// console.log(YPartyKitProvider)
import { getState } from "./state";
import { AgentLayout } from "./types";

import { distance } from "./utils";


const ydoc = new Y.Doc();


const roomname = `walky-space-${window.location.pathname}`;


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
  let agents = Array.from(newStates.values())
    .map((e) => e.agent)
    .filter((e) => e);

  processAgents(agents);
});

function processAgents(agents: AgentLayout[]) {
  let state = getState();

  let agentsMap: { [uuid: string]: AgentLayout } = {};
  state.agents.forEach((a) => {
    agentsMap[a.uuid] = a;
  });

  state.agents = agents.map((a) => {
    let pos = agentsMap[a.uuid]?.pos || a.pos;
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


export { sendUpdate };
