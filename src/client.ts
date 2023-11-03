
import { getState } from "./state";
import { AgentLayout, ClientMessageLayout, EntityLayout, MessageLayout } from "./types";

// import { distance } from "./utils";


let serverUrl = "localhost:1999/party/my-room"
let currentLocation = window.location.href;
serverUrl = new URL("/party/my-room", currentLocation).href;
// remove http or https from serverurl:
serverUrl = serverUrl.replace(/^https?:\/\//, '');

// if we're on localhost:1234, switch to localhost:1999:
if (window.location.hostname === 'localhost') {
  serverUrl = serverUrl.replace(/localhost:\d+/, 'localhost:1999');
}


// connect to the websocket at the address:
class WebSocketClient {
  websocket: WebSocket;

  constructor(serverUrl: string) {
    this.websocket = new WebSocket(serverUrl);
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.websocket.onopen = (event) => {
      console.log('Connection opened', event);
    };

    this.websocket.onclose = (event) => {
      console.log('Connection closed', event);
    };

    // Listen for messages from the server
    this.websocket.onmessage = (message) => {
      // parse message json as a map of agentLayouts:
      let data = JSON.parse(message.data) as MessageLayout
      // console.log(agentMap);
      let state = getState();
      if (data.type === "A") {
        let agentMap = data.data as { [key: string]: AgentLayout };
        let agents = Object.values(agentMap);
        state.agents = agents;
        agents.forEach((a) => {
          // console.log(a.pos, a.target)
        })
        //  agents.map((a) => {
        //   let pos = agentMap[a?.uuid]?.pos || a?.pos;
        //   if (distance(a.target, a.pos) < 1) {
        //     pos = a.pos;
        //   }
        //   return {
        //     ...a,
        //     pos,
        //   };
        // });
      } else if (data.type === "E") {
        let entityMap = data.data as { [key: string]: EntityLayout };
        state.entities = Object.values(entityMap);
      }
    };


    this.websocket.onerror = (error) => {
      console.log('WebSocket error', error);
    };
  }

  sendOrQueue(message: ClientMessageLayout) {
    if (websocketClient.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify(message));
    } else {
      this.websocket.addEventListener("open", () => {

        this.websocket.send(JSON.stringify(message));
      });
    }
  };

}

const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const websocketClient = new WebSocketClient(protocol + '//' + serverUrl);




// const ydoc = new Y.Doc();

// const bitmap = ydoc.getMap("bitmap");

// bitmap.observe((event) => {
// console.log(event)
// event.keysChanged.forEach((key) => {
// window.data[key] = 1
// })
// });
const roomname = `walky-space-${window.location.pathname}`;
function sendBitmapUpdate(i: number, val: number) {

  // bitmap.set(i.toString(), val);
}

// const yMapEnts: Y.Map<EntityLayout> = ydoc.getMap("entities");
// getState().entities = yMapEnts;


function sendEntityUpdate(entity: EntityLayout) {
  const { entities } = getState();

  let data: ClientMessageLayout = { type: "E", data: entity }
  websocketClient.sendOrQueue(data)
}

// function sendEntityDelete(uuid: string) {
//   console.log("deleting: " + uuid);
//   yMapEnts.delete(uuid);
// }





// const yProvider = new YPartyKitProvider(
//   "localhost:1999",
//   roomname,
//   ydoc
// );

// const awareness = yProvider.awareness;
// const myYId = awareness.clientID;

// You can observe when a user updates their awareness information
// awareness.on("change", (_changes: any) => {
//   // todo be more selective
//   const newStates = awareness.getStates();
//   let me = getState().me;
//   let agents = Array.from(newStates.values())
//     .map((e) => e.agent)
//     .filter((e) => e);
//   // .filter((e) => e && e?.uuid !== me?.uuid);

//   processAgents(agents);
// });

// function processAgents(agents: AgentLayout[]) {
//   let state = getState();

//   let agentsMap: { [uuid: string]: AgentLayout } = {};
//   state.agents.forEach((a) => {
//     agentsMap[a.uuid] = a;
//   });

//   state.agents = agents.map((a) => {
//     let pos = agentsMap[a?.uuid]?.pos || a?.pos;
//     if (distance(a.target, a.pos) < 1) {
//       pos = a.pos;
//     }
//     return {
//       ...a,
//       pos,
//     };
//   });
// }
let lastJSON = "";
function sendUpdate() {
  let newJSON = JSON.stringify({ type: "A", data: getState().me });
  if (lastJSON === newJSON) {
    return
  }
  websocketClient.sendOrQueue({ type: "A", data: getState().me })
  lastJSON = newJSON;
}


export { sendUpdate, sendBitmapUpdate, sendEntityUpdate };
