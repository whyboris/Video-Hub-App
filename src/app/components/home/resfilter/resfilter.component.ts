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
        this.currentX = event.clientX - 5;
      } else if (this.draggingRight === true) {
        console.log('right');
        this.currentX2 = event.clientX - 5;
      }
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
