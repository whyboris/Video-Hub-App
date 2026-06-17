import { Component, EventEmitter, Output, OnInit, input } from '@angular/core';

export interface ColorPickerPosition {
  x: number;
  y: number;
}

@Component({
  standalone: false,
  selector: 'app-tag-color-picker',
  templateUrl: './tag-color-picker.component.html',
  styleUrls: ['./tag-color-picker.component.scss']
})
export class TagColorPickerComponent implements OnInit {

  readonly position = input<ColorPickerPosition>(undefined);
  readonly currentColor = input<string>(undefined);
  readonly darkMode = input<boolean>(undefined);

  @Output() colorSelected = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();

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
    this.close.emit();
  }
}
