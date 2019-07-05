import 'reflect-metadata';
import '../polyfills';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';

import { TranslateModule } from '@ngx-translate/core';
import { VirtualScrollerModule } from 'ngx-virtual-scroller';

import { AlphabetPrefixService } from './components/pipes/alphabet-prefix.service';
import { AutoTagsSaveService } from './components/home/tags/tags-save.service';
import { AutoTagsService } from './components/home/tags/autotags.service';
import { ElectronService } from './providers/electron.service';
import { HomeComponent } from './components/home/home.component';
import { ManualTagsService } from './components/home/manual-tags/manual-tags.service';
import { ResolutionFilterService } from './components/pipes/resolution-filter.service';
import { ShowLimitService } from './components/pipes/show-limit.service';
import { StarFilterService } from './components/pipes/star-filter.service';
import { WordFrequencyService } from './components/pipes/word-frequency.service';

import { AddTagComponent } from './components/home/manual-tags/add-tag.component';
import { AppComponent } from './app.component';
import { ClipComponent } from './components/home/clip/clip.component';
import { DetailsComponent } from './components/home/details/details.component';
import { DonutComponent } from './components/donut/donut.component';
import { FileComponent } from './components/home/file/file.component';
import { FilmstripComponent } from './components/home/filmstrip/filmstrip.component';
import { FullViewComponent } from './components/home/full/full.component';
import { IconComponent } from './components/home/icon/icon.component';
import { MetaComponent } from './components/home/meta/meta.component';
import { PreviewComponent } from './components/home/thumbnail/preview.component';
import { SheetComponent } from './components/home/sheet/sheet.component';
import { SimilarityService } from './components/pipes/similarity.service';
import { SliderFilterComponent } from './components/home/slider-filter/slider-filter.component';
import { StatisticsComponent } from './components/home/statistics/statistics.component';
import { SvgDefinitionsComponent } from './components/home/icon/svg-definitions.component';
import { TagsComponent } from './components/home/tags/tags.component';
import { TopComponent } from './components/home/top/top.component';
import { ViewTagsComponent } from './components/home/manual-tags/view-tags.component';

import { AlphabetPrefixPipe } from './components/pipes/alphabet-prefix.pipe';
import { CountPipe } from './components/pipes/count.pipe';
import { FileSearchPipe } from './components/pipes/file-search.pipe';
import { FileSizePipe } from './components/pipes/file-size.pipe';
import { FolderArrowsPipe } from './components/pipes/folder-arrows.pipe';
import { FolderViewPipe } from './components/pipes/folder-view.pipe';
import { LengthFilterPipe } from './components/pipes/length-filter.pipe';
import { LengthPipe } from './components/pipes/length.pipe';
import { MagicSearchPipe } from './components/pipes/magic-search.pipe';
import { ManualTagSortPipe } from './components/pipes/manual-tags-sort.pipe';
import { ResolutionFilterPipe } from './components/pipes/resolution-filter.pipe';
import { SimilarityPipe } from './components/pipes/similarity.pipe';
import { SortingPipe } from './components/pipes/sorting.pipe';
import { StarFilterPipe } from './components/pipes/star-filter.pipe';
import { TagFilterPipe } from './components/home/tags/tag-filter.pipe';
import { TagMatchPipe } from './components/home/tags/tag-match.pipe';
import { TagsDisplayPipe } from './components/home/tags/tag-display.pipe';
import { WordFrequencyPipe } from './components/pipes/word-frequency.pipe';
import { WrapperPipe } from './components/pipes/wrapper.pipe';

@NgModule({
  declarations: [
    AddTagComponent,
    AlphabetPrefixPipe,
    AppComponent,
    ClipComponent,
    CountPipe,
    DetailsComponent,
    DonutComponent,
    FileComponent,
    FileSearchPipe,
    FileSizePipe,
    FilmstripComponent,
    FolderArrowsPipe,
    FolderViewPipe,
    FullViewComponent,
    HomeComponent,
    IconComponent,
    LengthFilterPipe,
    LengthPipe,
    MagicSearchPipe,
    ManualTagSortPipe,
    MetaComponent,
    PreviewComponent,
    ResolutionFilterPipe,
    SheetComponent,
    SimilarityPipe,
    SliderFilterComponent,
    SortingPipe,
    StarFilterPipe,
    StatisticsComponent,
    SvgDefinitionsComponent,
    TagFilterPipe,
    TagMatchPipe,
    TagsComponent,
    TagsDisplayPipe,
    TopComponent,
    ViewTagsComponent,
    WordFrequencyPipe,
    WrapperPipe,
  ],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    FormsModule,
    TranslateModule.forRoot(),
    VirtualScrollerModule,
  ],
  providers: [
    AlphabetPrefixService,
    AutoTagsSaveService,
    AutoTagsService,
    ElectronService,
    FileSearchPipe,
    ManualTagsService,
    ResolutionFilterService,
    ShowLimitService,
    SimilarityService,
    StarFilterService,
    WordFrequencyService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
