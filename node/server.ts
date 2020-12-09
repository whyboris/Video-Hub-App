import { GLOBALS } from "./main-globals";

import * as path from 'path';

const args = process.argv.slice(1);
const serve: boolean = args.some(val => val === '--serve');

// =================================================================================================

const remoteAppPath = serve
                      ? path.join(__dirname, 'remote/')
                      : path.join(process.resourcesPath, 'remote/');

let tempData: any;

const WebSocket = require('ws');

let wss;

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

  ipc.on('start-server', (event, data, pathToServe: string): void => {
    console.log('starting server!');
    tempData = data; // ImageElement[]
    startTheServer(pathToServe);
  });
}

function startTheServer(pathToServe: string): void {
  const express = require('express');
  const app = express();
  const appPort = 3000;

  // to handle JSON POST requests
  const bodyParser = require('body-parser');
  app.use(bodyParser.json());

  app.get('/lol', (req, res) => {
    res.send(`Hello World`);
  });

  app.get('/hello', (req, res) => {
    res.send(tempData);
  });

  app.post('/open', (req, res) => {
    console.log(req.body);
    res.send('success open');

    GLOBALS.angularApp.sender.send('remote-open-video', req.body);
  });

  console.log('Serving:', remoteAppPath);

  app.use(express.static(remoteAppPath));

  app.use('/images', express.static(pathToServe));

  app.listen(appPort, () => console.log(`Command server listening on port ${appPort}`));

  logIp();

  wss = new WebSocket.Server({ port: 8080 });

  wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
      console.log('received: %s', message);

      if (message === 'refresh-request') {
        GLOBALS.angularApp.sender.send('remote-send-new-data');
      }

    });

    ws.send('something something');
  });

}

function logIp(): void {
  const { networkInterfaces, hostname } = require('os');

  const nets = networkInterfaces();
  const results = Object.create(null); // or just '{}', an empty object

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
  console.log('host name:', hostname());
}
