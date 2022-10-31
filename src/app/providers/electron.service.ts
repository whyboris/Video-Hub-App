import { Injectable } from '@angular/core';

// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.
import type { ipcRenderer } from 'electron';
import type * as childProcess from 'child_process';
import type { webFrame } from 'electron';

@Injectable()
export class ElectronService {

  ipcRenderer: typeof ipcRenderer;
  childProcess: typeof childProcess;
  webFrame: typeof webFrame;

  constructor() {
    // Conditional imports
    if (this.isElectron()) {
      this.ipcRenderer = window.require('electron').ipcRenderer;
      this.webFrame = window.require('electron').webFrame;
      this.childProcess = window.require('child_process');
    }
  }

  isElectron = () => {
    return !!(window && window.process && window.process.type);
  }

}
