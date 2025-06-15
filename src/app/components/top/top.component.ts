import { Component, EventEmitter, Input, Output } from '@angular/core';
import type { ImageElement } from '../../../../interfaces/final-object.interface';

@Component({
  selector: 'app-top-component',
  templateUrl: './top.component.html',
  styleUrls: ['./top.component.scss', '../../fonts/icons.scss']
})
export class TopComponent {

  @Input() darkMode: boolean;

  // Handle folder input
  private _folder = '';
  @Input() set folderString(folderString: string) {
    this._folder = (folderString && folderString.trim()) || '';
    this.folderNameArray = this._folder.split('/');
    this.folderNameArray = this.folderNameArray.filter((element, index) => {
      return index === 0 || element !== '';
    });
  }
  get folderString(): string { return this._folder; }

  // Handle file input
  public _file = '';
  @Input() set fileString(fileString: string) {
    this._file = (fileString && fileString.trim()) || '';
    this.fileNameArray = this._file.split(' ');
  }
  get fileString(): string { return this._file; }

  // Inputs for thumbnail
  @Input() currentClickedItem: ImageElement;
  @Input() hubName: string;
  @Input() selectedOutputFolder: string;

  @Output() onFileWordClicked = new EventEmitter<string>();
  @Output() onFolderWordClicked = new EventEmitter<string>();
  @Output() onOpenInExplorer = new EventEmitter<boolean>();

  public folderNameArray: string[];
  public fileNameArray: string[];

  /**
   * Compute the thumbnail path for the selected file
   */
  getThumbnailPath(): string {
    if (this.currentClickedItem && this.hubName && this.selectedOutputFolder && this.currentClickedItem.cleanName !== '*FOLDER*') {
      return `file://${this.selectedOutputFolder}/vha-${this.hubName}/thumbnails/${this.currentClickedItem.hash}.jpg`;
    }
    return '';
  }

  public folderWordClicked(item: string): void {
    this.onFolderWordClicked.emit(item.trim());
  }

  public fileWordClicked(item: string): void {
    const regex = /{|}|\(|\)|\[|\]|\.|\,/g;
    item = item.replace(regex, '');
    this.onFileWordClicked.emit(item.trim());
  }

  public openInExplorer(): void {
    this.onOpenInExplorer.emit(true);
  }
}
