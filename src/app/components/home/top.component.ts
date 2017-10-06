import { Component, Input, OnInit, OnChanges } from '@angular/core';

@Component({
  selector: 'app-top-component',
  templateUrl: './top.component.html',
  styleUrls: ['./top.component.scss']
})
export class TopComponent implements OnInit {


  private _name = '';

  @Input() set folderString(folderString: string) {
    this._name = (folderString && folderString.trim()) || '<no name set>';
    this.wipArray = this._name.split('/');
  }

  get folderString(): string { return this._name; }


  private _name2 = '';

  @Input() set fileString(fileString: string) {
    this._name2 = (fileString && fileString.trim()) || '<no name set>';
    this.wipArray2 = this._name2.split(' ');
  }

  get fileString(): string { return this._name2; }


  public wipArray = ['third', 'fourth'];
  public wipArray2 = ['fourth', 'fifth'];

  // @Input() folderString: string;
  // @Input() fileString: string;

  ngOnInit() {
    console.log(this.folderString);
    console.log(this.fileString);
    // this.wipArray = this.folderString.split('_');
  }


  public folderWordClicked(item) {
    console.log(item);
  }

}
