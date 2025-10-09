import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';

export interface ColorPickerPosition {
  x: number;
  y: number;
}

@Component({
  selector: 'app-tag-color-picker',
  templateUrl: './tag-color-picker.component.html',
  styleUrls: ['./tag-color-picker.component.scss']
})
export class TagColorPickerComponent implements OnInit {

  @Input() position: ColorPickerPosition;
  @Input() currentColor: string;
  @Input() darkMode: boolean;

  @Output() colorSelected = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();

  // 3x3 grid of distinct colors plus default option
  colors: string[] = [
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#45B7D1', // Light Blue
    '#FFA07A', // Light Salmon
    '#98D8C8', // Mint
    '#F7DC6F', // Yellow
    '#BB8FCE', // Purple
    '#85C1E2', // Sky Blue
    '#F8B88B', // Peach
  ];

  defaultColor = '#2196F3'; // Default tag color

  constructor() { }

  ngOnInit() {
    // Adjust position to keep picker on screen
    const pickerWidth = 240;
    const pickerHeight = 300;

    if (this.position) {
      // Keep within horizontal bounds
      if (this.position.x + pickerWidth > window.innerWidth) {
        this.position.x = window.innerWidth - pickerWidth - 20;
      }

      // Keep within vertical bounds
      if (this.position.y + pickerHeight > window.innerHeight) {
        this.position.y = window.innerHeight - pickerHeight - 20;
      }

      // Ensure minimum position
      if (this.position.x < 10) this.position.x = 10;
      if (this.position.y < 10) this.position.y = 10;
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
