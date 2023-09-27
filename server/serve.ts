// Node.js WebSocket server script
import { startEndpoints } from "./endpoints";
import { startWsServer } from "./yjs/ws-server";

let server = startEndpoints();
startWsServer(server);
