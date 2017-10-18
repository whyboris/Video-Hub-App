import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-filmstrip-item',
  templateUrl: './filmstrip.component.html',
  styleUrls: ['./filmstrip.component.scss']
})
export class FilmstripComponent implements OnInit {

  @Input() stuff: any;
  @Input() folderPath: string;

  @Input() width: number;

  ngOnInit() { }

}
