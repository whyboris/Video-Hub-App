import { Component, OnInit, input, output } from '@angular/core';

import { ContextMenuCoordinate } from '../../../../interfaces/shared-interfaces';

@Component({
  standalone: false,
  selector: 'app-tag-color-picker',
  templateUrl: './tag-color-picker.component.html',
  styleUrls: ['./tag-color-picker.component.scss']
})
export class TagColorPickerComponent implements OnInit {

  readonly position = input<ContextMenuCoordinate>();
  readonly currentColor = input<string>();
  readonly darkMode = input<boolean>();

  readonly colorSelected = output<string>();
  readonly close = output<void>();

  // 3x3 grid of distinct colors plus default option
  colors: string[] = [
    '#FFADAD',
    '#FFD6A5',
    '#FDFFB6',
    '#CAFFBF',
    '#9BF6FF',
    '#A0C4FF',
    '#BDB2FF',
    '#FFC6FF',
    '#FFFFFF',
  ];

  constructor() { }

  ngOnInit() {
    // Adjust position to keep picker on screen
    const pickerWidth = 142;
    const pickerHeight = 65;

    const position = this.position();
    if (position) {
      // Keep within horizontal bounds
      if (position.x + pickerWidth > window.innerWidth) {
        position.x = window.innerWidth - pickerWidth - 30;
      }

      // Keep within vertical bounds
      if (position.y + pickerHeight > window.innerHeight) {
        position.y = window.innerHeight - pickerHeight - 30;
      }

      // Ensure minimum position
      if (position.x < 10) position.x = 10;
      if (position.y < 10) position.y = 10;
    }
  }

  selectColor(color: string): void {
    this.colorSelected.emit(color);
  }

  clearColor(): void {
    this.colorSelected.emit(null);
  }

  onClose(): void {
    // TODO: The 'emit' function requires a mandatory void argument
    this.close.emit();
  }
}
