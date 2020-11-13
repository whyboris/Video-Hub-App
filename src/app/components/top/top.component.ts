import { ImageElementService } from './../../services/image-element.service';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { StarRating, ImageElement } from '../../../../interfaces/final-object.interface';

@Component({
  selector: 'app-top-component',
  templateUrl: './top.component.html',
  styleUrls: ['./top.component.scss',
              '../../fonts/icons.scss']
})
export class TopComponent {

  @Input() video: ImageElement;
  @Input() darkMode: boolean;

  private starRatingHack = 0;
  @Input() set starRating(starRating: number) {
    this.starRatingHack = starRating;
  }
  get starRating(): number {return this.starRatingHack}

  constructor(
    public imageElementService: ImageElementService,
  ) { }

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

  @Output() onFileWordClicked = new EventEmitter<string>();
  @Output() onFolderWordClicked = new EventEmitter<string>();
  @Output() onOpenInExplorer = new EventEmitter<boolean>();

  public folderNameArray: Array<string>;
  public fileNameArray: Array<string>;

  public folderWordClicked(item: string): void {
    this.onFolderWordClicked.emit(item.trim());
  }

  public fileWordClicked(item: string): void {
    // Strip away any of: {}()[].,
    const regex = /{|}|\(|\)|\[|\]|\.|\,/g;
    item = item.replace(regex, '');
    this.onFileWordClicked.emit(item.trim());
  }

  public openInExplorer(): void {
    this.onOpenInExplorer.emit(true);
  }

  setStarRating(rating: StarRating): void {
    if (this.starRatingHack === rating) {
      rating = 0.5; // reset to "N/A" (not rated)
    }
    this.starRatingHack = rating; // hack for getting star opacity updated instantly
    this.imageElementService.HandleEmission({
      index: this.video.index,
      stars: rating
    });
  }
}
