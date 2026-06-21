import { Component, effect, Input, input, output } from '@angular/core';

import { FilePathService } from '../views/file-path.service';

import type { ImageElement } from '../../../../interfaces/final-object.interface';

@Component({
  standalone: false,
  selector: 'app-top-component',
  templateUrl: './top.component.html',
  styleUrls: ['./top.component.scss',
              '../../fonts/icons.scss']
})
export class TopComponent {

  readonly currentImageElement = input<ImageElement>(undefined);
  readonly darkMode = input<boolean>(undefined);
  readonly folderPath = input<string>(undefined);
  readonly hubName = input<string>(undefined);

  // Handle folder input
  private _folder = '';
  @Input() set folderString(folderString: string) {
    this._folder = (folderString && folderString.trim()) || '';
    this.folderNameArray = this._folder.split('/');
    this.folderNameArray = this.folderNameArray.filter((element, index) => {
      // TODO -- fix this up:
      return index === 0 || element !== ''; // ATROCIOUS hack! -- simply to prevent ["", ""]
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

  readonly onFileWordClicked = output<string>();
  readonly onFolderWordClicked = output<string>();
  readonly onOpenInExplorer = output<boolean>();
  readonly onPlayVideo = output<ImageElement>();
  readonly onOpenDetails = output<ImageElement>();

  folderNameArray: string[] = [];
  fileNameArray: string[] = [];

  previewPath: string = '';

  constructor(
    public filePathService: FilePathService,
  ) {
    effect(() => {
      this.updateThumbnailPath();
    })
  }

  updateThumbnailPath() {
    if (this.currentImageElement()) {
      this.previewPath = this.filePathService.createFilePath(this.folderPath(), this.hubName(), 'thumbnails', this.currentImageElement().hash);
    }
  }

  folderWordClicked(item: string): void {
    this.onFolderWordClicked.emit(item.trim());
  }

  fileWordClicked(item: string): void {
    // Strip away any of: {}()[].,
    const regex = /{|}|\(|\)|\[|\]|\.|\,/g;
    item = item.replace(regex, '');
    this.onFileWordClicked.emit(item.trim());
  }

  openInExplorer(): void {
    this.onOpenInExplorer.emit(true);
  }

  playFile(): void {
    this.onPlayVideo.emit(this.currentImageElement());
  }

  openDetails(): void {
    this.onOpenDetails.emit(this.currentImageElement());
  }

}
