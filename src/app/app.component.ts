import { Component } from '@angular/core';
import type { ElectronService } from './providers/electron.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {

  constructor(
    public electronService: ElectronService
  ) {

    if (electronService.isElectron()) {
      console.log('Mode electron');
    } else {
      console.log('Mode web');
    }
  }

}
