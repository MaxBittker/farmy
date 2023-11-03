import type * as Party from "partykit/server";
import { AgentLayout, EntityLayout, ClientMessageLayout } from "../src/types";
// import { v4 as uuidv4 } from "uuid";
import { updateAgent } from "../src/movement";
let agents = new Map<string, AgentLayout>();
let entities = new Map<string, EntityLayout>();


let millisPerTick = 1000 / 60;

let lastTick = Date.now();
function tick() {
  let elapsedMillis = Date.now() - lastTick;
  // console.log(elapsedMillis);
  let elapsedTicks = elapsedMillis / millisPerTick;
  agents.forEach((agent, uuid) => {
    updateAgent(agent, elapsedTicks);
  });
  lastTick = Date.now();
}
let i = 0;
export default class Server implements Party.Server {
  constructor(readonly party: Party.Party) {
    setInterval(() => {
      tick()
      i++
      if (i % 5 === 0) {
        this.sendAgentsUpdate()
      }

    }, millisPerTick);
  }
  sendAgentsUpdate() {
    let toSend = {
      type: "A",
      data: Object.fromEntries(agents),
    }
    this.party.broadcast(
      JSON.stringify(toSend),
    );
  }
  sendEntitiesUpdate() {
    let toSend = {
      type: "E",
      data: Object.fromEntries(entities),
    }
    this.party.broadcast(
      JSON.stringify(toSend),
    );
  }

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    console.log(
      `Connected:
  id: ${conn.id}
  room: ${this.party.id}
  url: ${new URL(ctx.request.url).pathname}`
    );

    let toSend =
      { type: "E", data: Object.fromEntries(entities) }
    this.party.broadcast(
      JSON.stringify(toSend),
    );
  }

  onMessage(message: string, sender: Party.Connection) {
    let data = JSON.parse(message) as ClientMessageLayout;
    if (data.type === "A") {
      let agent = data.data as AgentLayout;
      let serverAgent = agents.get(agent.uuid);
      if (serverAgent) {
        agent.pos = serverAgent.pos;
      }
      agents.set(agent.uuid, agent);
      sender['uuid'] = agent.uuid;
    } else if (data.type === "E") {
      let entity = data.data as EntityLayout;
      entities.set(entity.uuid, entity);
      this.sendEntitiesUpdate();
    }

  }

  onClose(conn: Party.Connection) {
    let agent = agents.get(conn['uuid']);
    if (agent) {
      agent.timeOfDeath = Date.now();
      agent.animation = "die";
      setTimeout(() => {
        if (agent) {

          agent.animation = "rot";
          setTimeout(() => {
            agents.delete(conn['uuid']);
          }, 2000); // 2 seconds
        }

      }, 1000); // 1 second
    }



    console.log(conn['uuid'] + " disconnected")
    console.log(agents)
  }
}

Server satisfies Party.Worker;
