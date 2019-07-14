import { Component, Input, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-slider-filter',
  templateUrl: './slider-filter.component.html',
  styleUrls: [ './slider-filter.component.scss' ]
})
export class SliderFilterComponent implements OnInit, OnDestroy {

  @Input() darkMode: boolean;
  @Input() minimumValue: number;
  @Input() maximumValue: number;
  @Input() steps: number;
  @Input() lengthFilter?: boolean = false;
  @Input() labelFormatPipe?: string;

  @Output() newSliderFilterSelected = new EventEmitter<number[]>();

  step: number;
  hover: boolean = false;

  dragging: boolean = false;
  draggingLeft: boolean = false;
  draggingRight: boolean = false;

  width: number = 160;

  currentXleft: number = 0;
  currentXright: number = this.width;

  leftBound: number;
  rightBound: number;

  constructor() { }

  ngOnInit() {
    this.step = (this.maximumValue - this.minimumValue) / this.steps;
    this.leftBound = this.minimumValue;
    this.rightBound = this.maximumValue;
  }

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
    return (this.width / this.steps) * Math.round((current / this.width) * this.steps);
  }

  /**
   * Return breakpoint based on px width of div
   * @param value
   */
  convertToIndex(value: number): number {

    const cutoff = (value / this.width) * (this.maximumValue - this.minimumValue) + this.minimumValue;

    if (this.lengthFilter && cutoff > this.maximumValue) {
      return Infinity;
    } else {
      return cutoff;
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
    this.newSliderFilterSelected.emit([this.leftBound, this.rightBound]);
  }

  ngOnDestroy() {
    this.newSliderFilterSelected.emit([this.minimumValue, this.maximumValue]);
  }

}
