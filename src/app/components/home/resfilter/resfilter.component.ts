import { Component, HostListener, Input, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-res-filter',
  templateUrl: './resfilter.component.html',
  styleUrls: [ './resfilter.component.scss' ]
})
export class ResFilter implements OnDestroy {

  @Input() darkMode: boolean;

  hover: boolean = false;

  dragging: boolean = false;
  draggingLeft: boolean = false;
  draggingRight: boolean = false;

  currentX: number = 0;
  currentX2: number = 160;

  constructor() { }

  @HostListener('mouseleave') onMouseLeave() {
    if (this.dragging) {
      console.log('dragging stopped');
      this.mouseIsUp();
    }
  }

  @HostListener('document:mousemove', ['$event']) onMouseMove(event) {
    if (this.dragging === true) {
      // console.log(event);
      if (this.draggingLeft === true) {
        console.log('left');
        const suggested = this.updateNumber(event.clientX);
        if (suggested < this.currentX2) {
          this.currentX = suggested;
        }
      } else if (this.draggingRight === true) {
        console.log('right');
        const suggested = this.updateNumber(event.clientX);
        if (suggested > this.currentX) {
          this.currentX2 = suggested;
        }
      }
    }
  }

  updateNumber(current: number): number {
    if (current < 20) {
      return 0;
    } else if (current < 60) {
      return 45;
    } else if (current < 100) {
      return 80;
    } else if (current < 140) {
      return 115;
    } else {
      return 160;
    }
  }

  rightSideClick(event: any): void {
    console.log(event);
    this.dragging = true;
    this.draggingRight = true;
  }
  
  leftSideClick(event: any): void {
    console.log(event);
    this.dragging = true;
    this.draggingLeft = true;
  }

  mouseIsDown(event: any): void {
    console.log('mouse is DOWN');
    this.dragging = true;
    this.currentX = event.clientX;
    console.log(event);
    console.log(event.clientX);
    console.log(event.offsetX);
  }
  
  mouseIsUp(event?: any): void {
    console.log('mouse is UP');
    this.dragging = false;
    this.draggingRight = false;
    this.draggingLeft = false;
    if (event) {
      console.log(event);
      console.log(event.clientX);
      console.log(event.offsetX);
    }
  }

  ngOnDestroy() {
    console.log('destroyed!');
  }

}
