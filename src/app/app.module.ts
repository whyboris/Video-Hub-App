import { ModalComponent } from './components/modal/modal.component';
import 'reflect-metadata';
import '../polyfills';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';

// External
import { AnQrcodeModule } from 'an-qrcode';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { VirtualScrollerModule } from 'ngx-virtual-scroller';

// Services
import { AutoTagsSaveService } from './components/tags-auto/tags-save.service';
import { AutoTagsService } from './components/tags-auto/autotags.service';
import { ElectronService } from './providers/electron.service';
import { FilePathService } from './components/views/file-path.service';
import { HomeComponent } from './components/home.component';
import { ImageElementService } from './services/image-element.service';
import { ManualTagsService } from './components/tags-manual/manual-tags.service';
import { ModalService } from './components/modal/modal.service';
import { ShortcutsService } from './components/shortcuts/shortcuts.service';
import { SourceFolderService } from './components/statistics/source-folder.service';

// Pipe Services
import { PipeSideEffectService } from '@pipes';
import { ResolutionFilterService } from '@pipes';
import { SimilarityService } from '@pipes';
import { StarFilterService } from '@pipes';
import { WordFrequencyService } from '@pipes';

// Components
import { AddTagComponent } from './components/tags-manual/add-tag.component';
import { AppComponent } from './app.component';
import { BreadcrumbsComponent } from './components/breadcrumbs/breadcrumbs.component';
import { ButtonComponent } from './components/button/button.component';
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
import { TagsComponent } from './components/tags-auto/tags.component';
import { TagTrayComponent } from './components/tag-tray/tag-tray.component';
import { ThumbnailComponent } from './components/views/thumbnail/thumbnail.component';
import { TitleBarComponent } from './components/title-bar/title-bar.component';
import { TopComponent } from './components/top/top.component';
import { ViewTagsComponent } from './components/tags-manual/view-tags.component';
import { WelcomeComponent } from './components/modal/welcome.component';
import { WizardComponent } from './components/wizard/wizard.component';

// Pipes
import { AlphabetizeSourceFoldersPipe } from './pipes/alphabetize-source-folders.pipe';
import { AlphabetPrefixPipe } from './pipes/alphabet-prefix.pipe';
import { AutoTagSortPipe } from './pipes/auto-tag-sort.pipe';
import { ButtonStylePipe } from './components/button/button-style.pipe';
import { CountPipe } from './pipes/count.pipe';
import { DeleteFilePipe } from './pipes/delete-file.pipe';
import { DuplicateFinderPipe } from './pipes/duplicateFinder.pipe';
import { FileSearchPipe } from './pipes/file-search.pipe';
import { FileSizeFilterPipe } from './pipes/file-size-filter.pipe';
import { FileSizePipe } from './pipes/file-size.pipe';
import { FolderArrowsPipe } from './pipes/folder-arrows.pipe';
import { FolderSizePipe } from './pipes/folder-size.pipe';
import { FolderViewPipe } from './pipes/folder-view.pipe';
import { FuzzySearchPipe } from './pipes/fuzzy-search.pipe';
import { HideOfflinePipe } from './pipes/hide-offline.pipe';
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
import { TimesPlayedFilterPipe } from './pipes/times-played-filter.pipe';
import { TimesPlayedPipe } from './pipes/times-played.pipe';
import { WordFrequencyPipe } from './pipes/word-frequency.pipe';
import { WrapperPipe } from './pipes/wrapper.pipe';
import { YearFilterPipe } from './pipes/year-filter.pipe';
import { YearPipe } from './pipes/year.pipe';

@NgModule({
  declarations: [
    AddTagComponent,
    AlphabetizeSourceFoldersPipe,
    AlphabetPrefixPipe,
    AppComponent,
    AutoTagSortPipe,
    BreadcrumbsComponent,
    ButtonComponent,
    ButtonStylePipe,
    ClipComponent,
    CountPipe,
    DeleteFilePipe,
    DetailsComponent,
    DonutComponent,
    DuplicateFinderPipe,
    FileComponent,
    FileSearchPipe,
    FileSizeFilterPipe,
    FileSizePipe,
    FilmstripComponent,
    FolderArrowsPipe,
    FolderSizePipe,
    FolderViewPipe,
    FullViewComponent,
    FuzzySearchPipe,
    HideOfflinePipe,
    HomeComponent,
    IconComponent,
    LengthFilterPipe,
    LengthPipe,
    MagicSearchPipe,
    ManualTagSortPipe,
    MetaComponent,
    ModalComponent,
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
    SimilarityPipe,
    SimilarTrayComponent,
    SliderFilterComponent,
    SortingPipe,
    SortOrderComponent,
    StarFilterComponent,
    StarFilterPipe,
    StatisticsComponent,
    SvgDefinitionsComponent,
    TagFilterPipe,
    TagFrequencyPipe,
    TagMatchPipe,
    TagsComponent,
    TagsDisplayPipe,
    TagTrayComponent,
    ThumbnailComponent,
    TimesPlayedFilterPipe,
    TimesPlayedPipe,
    TitleBarComponent,
    TopComponent,
    ViewTagsComponent,
    WelcomeComponent,
    WizardComponent,
    WordFrequencyPipe,
    WrapperPipe,
    YearFilterPipe,
    YearPipe,
  ],
  imports: [
    AnQrcodeModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    MatDialogModule,
    MatSnackBarModule,
    TranslateModule.forRoot(),
    VirtualScrollerModule,
  ],
  providers: [
    AutoTagsSaveService,
    AutoTagsService,
    ElectronService,
    FilePathService,
    ImageElementService,
    ManualTagsService,
    ModalService,
    PipeSideEffectService,
    ResolutionFilterService,
    ShortcutsService,
    SimilarityService,
    SortingPipe,
    SourceFolderService,
    StarFilterService,
    WordFrequencyService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
