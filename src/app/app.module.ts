import 'reflect-metadata';
import '../polyfills';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';

// External
import { TranslateModule } from '@ngx-translate/core';
import { VirtualScrollerModule } from 'ngx-virtual-scroller';

// Services
import { AutoTagsSaveService } from './components/tags-auto/tags-save.service';
import { AutoTagsService } from './components/tags-auto/autotags.service';
import { ElectronService } from './providers/electron.service';
import { FilePathService } from './components/views/file-path.service';
import { HomeComponent } from './components/home.component';
import { ManualTagsService } from './components/tags-manual/manual-tags.service';
import { PipeSideEffectService } from './pipes/pipe-side-effect.service';
import { ResolutionFilterService } from './pipes/resolution-filter.service';
import { SimilarityService } from './pipes/similarity.service';
import { StarFilterService } from './pipes/star-filter.service';
import { WordFrequencyService } from './pipes/word-frequency.service';

// Components
import { AddTagComponent } from './components/tags-manual/add-tag.component';
import { AppComponent } from './app.component';
import { BreadcrumbsComponent } from './components/breadcrumbs/breadcrumbs.component';
import { ClipComponent } from './components/views/clip/clip.component';
import { DetailsComponent } from './components/views/details/details.component';
import { DonutComponent } from './components/donut/donut.component';
import { FileComponent } from './components/views/file/file.component';
import { FilmstripComponent } from './components/views/filmstrip/filmstrip.component';
import { FullViewComponent } from './components/views/full/full.component';
import { IconComponent } from './components/icon/icon.component';
import { MetaComponent } from './components/meta/meta.component';
import { RecentlyOpenedComponent } from './components/recently-opened/recently-opened.component';
import { RenameFileComponent } from './components/rename-file/rename-file.component';
import { RenameModalComponent } from './components/rename-modal/rename-modal.component';
import { ResolutionFilterComponent } from './components/resolution-filter/resolution-filter.component';
import { RibbonComponent } from './components/ribbon/ribbon.component';
import { SearchBoxesComponent } from './components/search-boxes/search-boxes.component';
import { SettingsComponent } from './components/settings/settings.component';
import { SheetComponent } from './components/sheet/sheet.component';
import { ShortcutsComponent } from './components/shortcuts/shortcuts.component';
import { SimilarTrayComponent } from './components/similar-tray/similar-tray.component';
import { SliderFilterComponent } from './components/slider-filter/slider-filter.component';
import { SortOrderComponent } from './components/sort-order/sort-order.component';
import { StarFilterComponent } from './components/star-filter/star-filter.component';
import { StatisticsComponent } from './components/statistics/statistics.component';
import { SvgDefinitionsComponent } from './components/icon/svg-definitions.component';
import { TagTrayComponent } from './components/tag-tray/tag-tray.component';
import { TagsComponent } from './components/tags-auto/tags.component';
import { ThumbnailComponent } from './components/views/thumbnail/thumbnail.component';
import { TitleBarComponent } from './components/title-bar/title-bar.component';
import { TopComponent } from './components/top/top.component';
import { ViewTagsComponent } from './components/tags-manual/view-tags.component';
import { WizardComponent } from './components/wizard/wizard.component';

// Pipes
import { AlphabetPrefixPipe } from './pipes/alphabet-prefix.pipe';
import { CountPipe } from './pipes/count.pipe';
import { DeleteFilePipe } from './pipes/delete-file.pipe';
import { DuplicateFinderPipe } from './pipes/duplicateFinder.pipe';
import { FileSearchPipe } from './pipes/file-search.pipe';
import { FileSizePipe } from './pipes/file-size.pipe';
import { FolderArrowsPipe } from './pipes/folder-arrows.pipe';
import { FolderViewPipe } from './pipes/folder-view.pipe';
import { FuzzySearchPipe } from './pipes/fuzzy-search.pipe';
import { LengthFilterPipe } from './pipes/length-filter.pipe';
import { LengthPipe } from './pipes/length.pipe';
import { MagicSearchPipe } from './pipes/magic-search.pipe';
import { ManualTagSortPipe } from './pipes/manual-tags-sort.pipe';
import { PlaylistPipe } from './pipes/playlist.pipe';
import { RegexSearchPipe } from './pipes/regex-search.pipe';
import { ResolutionFilterPipe } from './pipes/resolution-filter.pipe';
import { ReturnZeroPipe } from './pipes/return-zero.pipe';
import { SidebarHeightPipe } from './pipes/sidebar-height.pipe';
import { SimilarityPipe } from './pipes/similarity.pipe';
import { SortingPipe } from './pipes/sorting.pipe';
import { StarFilterPipe } from './pipes/star-filter.pipe';
import { TagFilterPipe } from './components/tags-auto/tag-filter.pipe';
import { TagFrequencyPipe } from './components/tags-auto/tag-frequency.pipe';
import { TagMatchPipe } from './components/tags-auto/tag-match.pipe';
import { TagsDisplayPipe } from './components/tags-auto/tag-display.pipe';
import { WordFrequencyPipe } from './pipes/word-frequency.pipe';
import { WrapperPipe } from './pipes/wrapper.pipe';

@NgModule({
  declarations: [
    AddTagComponent,
    AlphabetPrefixPipe,
    AppComponent,
    BreadcrumbsComponent,
    ClipComponent,
    CountPipe,
    DeleteFilePipe,
    DetailsComponent,
    DonutComponent,
    DuplicateFinderPipe,
    FileComponent,
    FileSearchPipe,
    FileSizePipe,
    FilmstripComponent,
    FolderArrowsPipe,
    FolderViewPipe,
    FullViewComponent,
    FuzzySearchPipe,
    HomeComponent,
    IconComponent,
    LengthFilterPipe,
    LengthPipe,
    MagicSearchPipe,
    ManualTagSortPipe,
    MetaComponent,
    PlaylistPipe,
    RecentlyOpenedComponent,
    RegexSearchPipe,
    RenameFileComponent,
    RenameModalComponent,
    ResolutionFilterComponent,
    ResolutionFilterPipe,
    ReturnZeroPipe,
    RibbonComponent,
    SearchBoxesComponent,
    SettingsComponent,
    SheetComponent,
    ShortcutsComponent,
    SidebarHeightPipe,
    SimilarTrayComponent,
    SimilarityPipe,
    SliderFilterComponent,
    SortOrderComponent,
    SortingPipe,
    StarFilterComponent,
    StarFilterPipe,
    StatisticsComponent,
    SvgDefinitionsComponent,
    TagFilterPipe,
    TagFrequencyPipe,
    TagMatchPipe,
    TagTrayComponent,
    TagsComponent,
    TagsDisplayPipe,
    ThumbnailComponent,
    TitleBarComponent,
    TopComponent,
    ViewTagsComponent,
    WizardComponent,
    WordFrequencyPipe,
    WrapperPipe,
  ],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    TranslateModule.forRoot(),
    VirtualScrollerModule,
  ],
  providers: [
    AutoTagsSaveService,
    AutoTagsService,
    ElectronService,
    FilePathService,
    ManualTagsService,
    PipeSideEffectService,
    ResolutionFilterService,
    SimilarityService,
    SortingPipe,
    StarFilterService,
    WordFrequencyService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
