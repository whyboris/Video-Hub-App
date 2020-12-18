import { GLOBALS } from "./main-globals";

import * as path from 'path';

const express = require('express');
// const bodyParser = require('body-parser'); ----------------------------- disabled
const WebSocket = require('ws');

import { ImageElement } from "../interfaces/final-object.interface";

const args = process.argv.slice(1);
const serve: boolean = args.some(val => val === '--serve');

import { RemoteSettings } from "../interfaces/settings-object.interface";

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

type SocketMessageType = 'open-file' | 'refresh-request' | 'save-settings';

interface SocketMessage {
  type: SocketMessageType;
  data?: any;
}

// =================================================================================================

// transcode

const ffprobePath = require('@ffprobe-installer/ffprobe').path.replace('app.asar', 'app.asar.unpacked');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path.replace('app.asar', 'app.asar.unpacked');
const spawn = require('child_process').spawn;

// ---

export function setUpIpcForServer(ipc) {

  ipc.on('latest-gallery-view', (event, data): void => {
    console.log('last message');
    if (wss) {
      console.log('WSS EXISTS !!');
      wss.clients.forEach(function each(client) {

        console.log(client.readyState);

        if (client.readyState === WebSocket.OPEN) {
          console.log('sending');
          client.send(JSON.stringify({
            type: 'gallery',
            data: data
          }));
        }
      });
    }
  });

  ipc.on('start-server', (event, data: ImageElement[], pathToServe: string, port: number, remoteSettings: RemoteSettings): void => {
    currentHubImageElements = data;
    startTheServer(pathToServe, port || EXPRESS_PORT);
    logIp(port || EXPRESS_PORT);
    startSockets(WSS_PORT, remoteSettings);
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


  app.get('/video', (req, res) => {
    const seekTime = req.query.seek || 0;
    const file = req.query.file || '';
    // see https://trac.ffmpeg.org/wiki/Encode/H.264#a2.Chooseapreset for more options
    const ffmpeg = spawn(ffmpegPath, [
      '-ss', seekTime,
      '-i', file,
      '-f', 'mp4',
      '-crf', '17',
      '-preset', 'ultrafast',
      '-movflags', 'frag_keyframe+empty_moov+faststart',
      '-frag_duration', '15',
      'pipe:1'
    ]);
    res.writeHead(200, {
      'Content-Type': 'video/mp4'
    });
    ffmpeg.stdout.pipe(res);
    // error logging
    ffmpeg.stderr.setEncoding('utf8');
    ffmpeg.stderr.on('data', (data) => {
        console.log(data);
    });
  });



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
function startSockets(port: number, remoteSettings?: RemoteSettings): void {
  wss = new WebSocket.Server({ port: port });

  wss.on('connection', function connection(ws) {

    ws.on('message', socketMessageHandler);

    ws.send(JSON.stringify({
      type: 'settings',
      data: remoteSettings
    }));
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

    } else if (parsed.type === 'save-settings') {

      GLOBALS.angularApp.sender.send('remote-save-settings', parsed.data);

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

const { networkInterfaces, hostname } = require('os');
const ip = require("ip");

/**
 * Log the user's IP
 */
function logIp(port: number): void {

  const nets = networkInterfaces();
  const results = {};
  // Thank you for the solution: https://stackoverflow.com/a/8440736/5017391
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // skip over non-ipv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === 'IPv4' && !net.internal) {
        if (!results[name]) {
          results[name] = [];
        }

        results[name].push(net.address);
      }
    }
  }

  console.log(results);

  let wifi = '';

  if (results['Wi-Fi']) { // PC shows up this way
    wifi = results['Wi-Fi'][0];
  } else if (results['en0']) { // Mac shows up this way
    wifi = results['en0'][0];  // will likely be incorrect if Mac is also connected via ethernet
  } else {
    wifi = ip.address(); // this grabs the first IP which may be ethernet
  }

  console.log('host name:', hostname());
  console.log('ip:', wifi);

  GLOBALS.angularApp.sender.send('remote-ip-address', wifi, hostname(), port);
}
