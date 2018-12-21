import { Component, HostListener, Input, OnDestroy, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-res-filter',
  templateUrl: './resfilter.component.html',
  styleUrls: [ './resfilter.component.scss' ]
})
export class ResFilterComponent implements OnDestroy {

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

  pxLocation: number[] = [0, 45, 80, 115, 160]; // pixel locations for divs that users drag

  constructor() { }

  /**
   * Mouse left the res filter div
   */
  mouseLeft() {
    if (this.dragging) {
      this.mouseIsUp();
    }
  }

  /**
   * Track the mouse movement while it's inside the res filter div
   * @param event
   */
  mouseIsMoving(event) {
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

  /**
   * Return appropriate breakpoint (to be used as px for width of div)
   * @param current
   */
  updateNumber(current: number): number {
    if (current < 30) {
      return this.pxLocation[0];
    } else if (current < 70) {
      return this.pxLocation[1];
    } else if (current < 105) {
      return this.pxLocation[2];
    } else if (current < 142) {
      return this.pxLocation[3];
    } else {
      return this.pxLocation[4];
    }
  }

  /**
   * Return breakpoint based on px width of div
   * @param value
   */
  convertToIndex(value: number): number {
    if (value === this.pxLocation[0]) {
      return 0;
    } else if (value === this.pxLocation[1]) {
      return 1;
    } else if (value === this.pxLocation[2]) {
      return 2;
    } else if (value === this.pxLocation[3]) {
      return 3;
    } else {
      return 4;
    }
  }

  /**
   * User clicked (and is dragging) right dragger
   * @param event
   */
  rightSideClick(event: any): void {
    this.dragging = true;
    this.draggingRight = true;
  }

  /**
   * User clicked (and is dragging) left dragger
   * @param event
   */
  leftSideClick(event: any): void {
    this.dragging = true;
    this.draggingLeft = true;
  }

  /**
   * User stopped dragging
   */
  mouseIsUp(): void {
    this.dragging = false;
    this.draggingRight = false;
    this.draggingLeft = false;
    this.leftBound = this.convertToIndex(this.currentXleft);
    this.rightBound = this.convertToIndex(this.currentXright);
    this.newResFilterSelected.emit([this.leftBound, this.rightBound]);
  }

  ngOnDestroy() {
    console.log('destroyed!');
    this.newResFilterSelected.emit([0, 4]);
  }

}
