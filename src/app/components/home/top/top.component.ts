import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';

@Component({
  selector: 'app-top-component',
  templateUrl: './top.component.html',
  styleUrls: ['./top.component.scss',
              '../fonts/icons.scss']
})
export class TopComponent {

  @Input() darkMode: boolean;

  // Handle folder input
  private _folder = '';
  @Input() set folderString(folderString: string) {
    this._folder = (folderString && folderString.trim()) || '';
    // Turn backslashes into forward slashes
    this._folder = this._folder.replace(/\\/g, '/');
    this.folderNameArray = this._folder.split('/');
  }
  get folderString(): string { return this._folder; }

  // Handle file input
  private _file = '';
  @Input() set fileString(fileString: string) {
    this._file = (fileString && fileString.trim()) || '';
    this.fileNameArray = this._file.split(' ');
  }
  get fileString(): string { return this._file; }

  @Output() onFileWordClicked = new EventEmitter<string>();
  @Output() onFolderWordClicked = new EventEmitter<string>();
  @Output() onOpenInExplorer = new EventEmitter<boolean>();

  public folderNameArray: Array<string>;
  public fileNameArray: Array<string>;

  public folderWordClicked(item): void {
    this.onFolderWordClicked.emit(item.trim());
  }

  public fileWordClicked(item): void {
    // Strip away any of: {}()[].,
    const regex = /{|}|\(|\)|\[|\]|\.|\,/g;
    item = item.replace(regex, '');
    this.onFileWordClicked.emit(item.trim());
  }

  public openInExplorer(): void {
    this.onOpenInExplorer.emit(true);
  }

}
