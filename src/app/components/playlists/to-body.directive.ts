import type { OnDestroy, OnInit } from '@angular/core';
import { Directive, ElementRef } from '@angular/core';

/**
 * Moves the element to `document.body` while it exists
 * The sidebar and gallery use CSS transforms, which trap `position: fixed` popups inside them
 * (clipped by the sidebar's edge and offset); at the body level a popup can go anywhere
 */
@Directive({
  standalone: false,
  selector: '[appToBody]',
})
export class ToBodyDirective implements OnInit, OnDestroy {

  constructor(private elementRef: ElementRef<HTMLElement>) { }

  ngOnInit(): void {
    document.body.appendChild(this.elementRef.nativeElement);
  }

  ngOnDestroy(): void {
    this.elementRef.nativeElement.remove();
  }

}
