import { GLOBALS } from "./main-globals";

import * as path from 'path';

const express = require('express');
// const bodyParser = require('body-parser'); ----------------------------- disabled
const WebSocket = require('ws');

import { ImageElement } from "../interfaces/final-object.interface";

const args = process.argv.slice(1);
const serve: boolean = args.some(val => val === '--serve');

// =================================================================================================

const remoteAppPath = serve
                      ? path.join(__dirname, 'remote/')
                      : path.join((process as any).resourcesPath, 'remote/');
                      // Electron ^^^^^^^ extends `process` with `resourcesPath`
                      // https://www.electronjs.org/docs/api/process#processresourcespath-readonly

let serverRef; // reference to express server
let wss;       // reference to Web Socket Server

let currentHubImageElements: ImageElement[];

const EXPRESS_PORT: number = 3000;
const WSS_PORT: number = 8080;

type SocketMessageType = 'open-file' | 'refresh-request';

interface SocketMessage {
  type: SocketMessageType;
  data?: any;
}

// =================================================================================================

export function setUpIpcForServer(ipc) {

  ipc.on('latest-gallery-view', (event, data): void => {
    console.log('last message');
    if (wss) {
      console.log('WSS EXISTS !!');
      wss.clients.forEach(function each(client) {

        console.log(client.readyState);

        if (client.readyState === WebSocket.OPEN) {
          console.log('sending');
          client.send(JSON.stringify(data));
        }
      });
    }
  });

  ipc.on('start-server', (event, data: ImageElement[], pathToServe: string, port: number): void => {
    currentHubImageElements = data;
    startTheServer(pathToServe, port || EXPRESS_PORT);
    logIp(port || EXPRESS_PORT);
    startSockets(WSS_PORT);
  });

  ipc.on('stop-server', (event): void => {
    stopTheServers();
  });
}

/**
 * Start the Express server
 * @param pathToServe - full path to folder with all images
 * @param port - port to use
 */
function startTheServer(pathToServe: string, port: number): void {
  const app = express();

  // app.use(bodyParser.json()); // to handle JSON POST requests ------ disabled

  //  GET endpoint to respond with the full `ImageElement[]`
  // ------------------------------------------------------------------ disabled
  // app.get('/hub', (req, res) => {
  //   res.send(currentHubImageElements);
  // });

  //  POST endpoint to ask VHA to play a video from some starting point
  // ------------------------------------------------------------------ disabled
  // app.post('/open', (req, res) => {
  //   GLOBALS.angularApp.sender.send('remote-open-video', req.body);
  //   res.end();
  // });

  // Serve the Angular VHA remote control app
  app.use(express.static(remoteAppPath));

  // Serve all the images from the hub
  app.use('/images', express.static(pathToServe));

  console.log('Serving:', remoteAppPath);
  serverRef = app.listen(port, () => console.log('VHA server listening on port', port));
}

/**
 * Start the socket server
 * @param port - the port to use
 */
function startSockets(port: number): void {
  wss = new WebSocket.Server({ port: port });

  wss.on('connection', function connection(ws) {

    ws.on('message', socketMessageHandler);

    ws.send('TODO: send over preferred settings ?');
  });
}

/**
 * Handler for all the incoming socket messages
 */
const socketMessageHandler = (message: string): void => {
  // all messages are strings from JSON.stringify(data as SocketMessage)
  console.log('received message');

  try {
    const parsed: SocketMessage = JSON.parse(message);

    if (parsed.type === 'refresh-request') {

      GLOBALS.angularApp.sender.send('remote-send-new-data');

    } else if (parsed.type === 'open-file') {

      GLOBALS.angularApp.sender.send('remote-open-video', parsed.data);

    }

  } catch {
    console.log('ERROR: message was not JSON encoded');
  }
}

/**
 * Shut down the Express and WebSocket servers
 */
function stopTheServers(): void {
  if (serverRef && typeof serverRef.close === "function") {
    serverRef.close();
    console.log('closed Express server');
  }
  if (wss && typeof wss.close === "function") {
    wss.close();
    console.log('closed Socket server');
  }
}

const ip = require("ip");

/**
 * Log the user's IP
 */
function logIp(port: number): void {
  const { hostname } = require('os');

  console.log('host name:', hostname());
  console.log('ip:', ip.address());
  GLOBALS.angularApp.sender.send('remote-ip-address', ip.address(), hostname(), port);
}
