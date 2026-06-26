import { Component, input, output, viewChild } from '@angular/core';

import { ManualTagsService } from './manual-tags.service';

import type { OnInit, ElementRef } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-add-tag-component',
  templateUrl: 'add-tag.component.html',
  styleUrls: ['../search-input.scss',
              'add-tag.component.scss']
})
export class AddTagComponent implements OnInit {

  readonly darkMode = input<boolean>();

  readonly tag = output<string>();

  readonly tagInputField = viewChild<ElementRef<HTMLInputElement>>('tagInputField');

  currentText = '';
  typeAhead = '';

  constructor(
    public manualTagsService: ManualTagsService
  ) { }

  ngOnInit(): void {
    this.tagInputField()?.nativeElement.focus();
  }

  emitTag(text: string) {
    if (text.trim()) { // if not empty
      this.tag.emit(text.trim());
      this.currentText = '';
      this.typeAhead = '';
    }
  }

  checkTypeahead(text: string) {
    this.typeAhead = this.manualTagsService.getTypeahead(text);
  }

  tabPressed(keypress: KeyboardEvent): void {
    if (this.typeAhead !== '') {
      this.emitTag(this.typeAhead);
      keypress.preventDefault();
    }
  }

  /**
   * User pressed the `esc` key
   */
  escape(): void {
    this.currentText = '';
    this.typeAhead = '';
  }

}
