import { Component, OnInit } from '@angular/core';
import { ElectronService }     from './providers/electron.service';
import { ImageElementService } from './services/image-element.service';
import type { ImageElement }   from '../../interfaces/final-object.interface';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  duplicates: ImageElement[] = [];

  constructor(
    public electronService: ElectronService,
    private imageElementService: ImageElementService
  ) {}

  ngOnInit(): void {
    if (this.electronService.isElectron()) {
      console.log('Mode electron');
    } else {
      console.log('Mode web');
    }
  }

  /** Called when the user clicks “Find Duplicates” */
  checkDuplicates(): void {
    this.duplicates = this.imageElementService.findDuplicatesByTagsOrName();
    console.log('Found duplicates:', this.duplicates);
  }
}
