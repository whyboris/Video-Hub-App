import { ImageElement } from './../../../interfaces/final-object.interface';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImageElementService {

public imageElements: ImageElement[] = [];
constructor() { }

}
