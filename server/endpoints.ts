import * as path from "path";
import * as http from "http";
import * as https from "https";
import express from "express";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config({ path: __dirname + "/.env" });

// Certificate
const privateKey = fs.readFileSync(
  "/etc/letsencrypt/live/walky.space/privkey.pem",
  "utf8"
);
const certificate = fs.readFileSync(
  "/etc/letsencrypt/live/walky.space/cert.pem",
  "utf8"
);
const ca = fs.readFileSync(
  "/etc/letsencrypt/live/walky.space/chain.pem",
  "utf8"
);

const credentials = {
  key: privateKey,
  cert: certificate,
  ca: ca,
};


function startEndpoints(): https.Server {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true })); //Parse URL-encoded bodies

  const httpServer = http.createServer(app);
  const httpsServer = https.createServer(credentials, app);

  app.use(express.static("../docs"));
  app.use("/files", express.static("./uploads"));



  app.get("*", function (request, response) {
    response.sendFile(path.resolve(__dirname, "../docs/index.html"));
  });

  httpServer.listen(80, () => {
    console.log(`Server is listening on port ${80}`);
  });
  httpsServer.listen(443, () => {
    console.log(`Server is listening on port ${443}`);
  });


  return httpsServer;
}

export { startEndpoints };
