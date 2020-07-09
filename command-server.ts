const express = require('express');
const commandServer = express();
const commandServerPort = 3000;
const { ipcMain } = require('electron');




module.exports = function(webContents) {
  commandServer.get('/', (req, res) => {
    webContents.send('command-server', {'action': 'CLEAR_WEBFRAME_CACHE'});
    res.send(`Hello World`);
  });

  commandServer.listen(commandServerPort, () => console.log(`Command server listening on port ${commandServerPort}`));

};

