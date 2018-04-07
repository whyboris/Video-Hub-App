import { Component, HostListener, Input, OnDestroy, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-res-filter',
  templateUrl: './resfilter.component.html',
  styleUrls: [ './resfilter.component.scss' ]
})
export class ResFilter implements OnDestroy {

  @Input() darkMode: boolean;

  @Output() newResFilterSelected = new EventEmitter<number[]>();

  hover: boolean = false;

  dragging: boolean = false;
  draggingLeft: boolean = false;
  draggingRight: boolean = false;

  currentXleft: number = 0;
  currentXright: number = 160;

  leftBound: number = 0;
  rightBound: number = 4;

  constructor() { }

  @HostListener('mouseleave') onMouseLeave() {
    if (this.dragging) {
      this.mouseIsUp();
    }
  }

  @HostListener('document:mousemove', ['$event']) onMouseMove(event) {
    if (this.dragging === true) {
      if (this.draggingLeft === true) {
        const suggested = this.updateNumber(event.clientX);
        if (suggested < this.currentXright) {
          this.currentXleft = suggested;
        }
      } else if (this.draggingRight === true) {
        const suggested = this.updateNumber(event.clientX);
        if (suggested > this.currentXleft) {
          this.currentXright = suggested;
        }
      }
    }
  }

  updateNumber(current: number): number {
    if (current < 30) {
      return 0;
    } else if (current < 70) {
      return 45;
    } else if (current < 105) {
      return 80;
    } else if (current < 142) {
      return 115;
    } else {
      return 160;
    }
  }

  rightSideClick(event: any): void {
    this.dragging = true;
    this.draggingRight = true;
  }
  
  leftSideClick(event: any): void {
    this.dragging = true;
    this.draggingLeft = true;
  }
  
  mouseIsUp(event?: any): void {
    this.dragging = false;
    this.draggingRight = false;
    this.draggingLeft = false;
    this.leftBound = this.convertToIndex(this.currentXleft);
    this.rightBound = this.convertToIndex(this.currentXright);
    this.newResFilterSelected.emit([this.leftBound, this.rightBound]);
  }

  convertToIndex(value: number): number {
    if (value === 0) {
      return 0;
    } else if (value === 45) {
      return 1;
    } else if (value === 80) {
      return 2;
    } else if (value === 115) {
      return 3;
    } else {
      return 4;
    }
  }

  ngOnDestroy() {
    console.log('destroyed!');
    this.newResFilterSelected.emit([0, 4]);
  }

}
