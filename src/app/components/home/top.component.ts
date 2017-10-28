import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-top-component',
  templateUrl: './top.component.html',
  styleUrls: ['./top.component.scss',
              './photon/photon.min.css']
})
export class TopComponent implements OnInit {

  private _folder = '';
  @Input() set folderString(folderString: string) {
    this._folder = (folderString && folderString.trim()) || '';

    // @TODO need to remove the first slash !!!

    this.folderNameArray = this._folder.split('/');
    console.log(this.folderNameArray);
  }
  get folderString(): string { return this._folder; }


  private _file = '';
  @Input() set fileString(fileString: string) {
    this._file = (fileString && fileString.trim()) || '';
    this.fileNameArray = this._file.split(' ');
  }
  get fileString(): string { return this._file; }

  @Output() onFileWordClicked = new EventEmitter<string>();
  @Output() onFolderWordClicked = new EventEmitter<string>();

  public folderNameArray: Array<string>;
  public fileNameArray: Array<string>;

  // @Input() folderString: string;
  // @Input() fileString: string;

  ngOnInit() {
    // console.log(this.folderString);
    // console.log(this.fileString);
    // this.wipArray = this.folderString.split('_');
  }


  public folderWordClicked(item) {
    this.onFolderWordClicked.emit(item.trim());
  }

  public fileWordClicked(item) {
    this.onFileWordClicked.emit(item.trim());
  }

}
