import { Component, Input, OnInit, OnChanges } from '@angular/core';

@Component({
  selector: 'app-top-component',
  templateUrl: './top.component.html',
  styleUrls: ['./top.component.scss',
              './photon/photon.min.css']
})
export class TopComponent implements OnInit {


  private _name = '';

  @Input() set folderString(folderString: string) {
    this._name = (folderString && folderString.trim()) || '';

    // @TODO need to remove the first slash !!!

    this.folderNameArray = this._name.split('/');
    console.log(this.folderNameArray);
  }

  get folderString(): string { return this._name; }


  private _name2 = '';

  @Input() set fileString(fileString: string) {
    this._name2 = (fileString && fileString.trim()) || '';
    this.fileNameArray = this._name2.split(' ');
  }

  get fileString(): string { return this._name2; }


  public folderNameArray: Array<string>;
  public fileNameArray: Array<string>;

  // @Input() folderString: string;
  // @Input() fileString: string;

  ngOnInit() {
    console.log(this.folderString);
    console.log(this.fileString);
    // this.wipArray = this.folderString.split('_');
  }


  public folderWordClicked(item) {
    console.log('folder item: ' + item);
  }

  public fileWordClicked(item) {
    console.log('file item: ' + item);
  }

}
