import 'zone.js/dist/zone-mix';
import 'reflect-metadata';
import 'polyfills';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { VirtualScrollModule } from 'angular2-virtual-scroll';

import { ElectronService } from './providers/electron.service';
import { HomeComponent } from './components/home/home.component';
import { ResolutionFilterService } from './components/pipes/resolution-filter.service';
import { ShowLimitService } from 'app/components/pipes/show-limit.service';
import { TagsService } from './components/home/tags/tags.service';
import { WordFrequencyService } from 'app/components/pipes/word-frequency.service';

import { AppComponent } from './app.component';
import { DonutComponent } from './components/donut/donut.component';
import { FileComponent } from 'app/components/home/file/file.component';
import { FilmstripComponent } from 'app/components/home/filmstrip/filmstrip.component';
import { PreviewComponent } from './components/home/thumbnail/preview.component';
import { ResFilter } from './components/home/resfilter/resfilter.component';
import { SimilarityService } from './components/pipes/similarity.service';
import { TagsComponent } from './components/home/tags/tags.component';
import { TopComponent } from './components/home/top/top.component';

import { CountPipe } from './components/pipes/count.pipe';
import { FileSearchPipe } from './components/pipes/file-search.pipe';
import { FileSizePipe } from './components/pipes/file-size.pipe';
import { FolderArrowsPipe } from 'app/components/pipes/folder-arrows.pipe';
import { FolderViewPipe } from 'app/components/pipes/folder-view.pipe';
import { LengthPipe } from './components/pipes/length.pipe';
import { MagicSearchPipe } from './components/pipes/magic-search.pipe';
import { RandomizePipe } from './components/pipes/randomize.pipe';
import { ResolutionFilterPipe } from './components/pipes/resolution-filter.pipe';
import { SimilarityPipe } from './components/pipes/similarity.pipe';
import { WordFrequencyPipe } from 'app/components/pipes/word-frequency.pipe';

import { AppRoutingModule } from './app-routing.module';

@NgModule({
  declarations: [
    AppComponent,
    CountPipe,
    DonutComponent,
    FileComponent,
    FileSearchPipe,
    FileSizePipe,
    FilmstripComponent,
    FolderArrowsPipe,
    FolderViewPipe,
    HomeComponent,
    LengthPipe,
    SimilarityPipe,
    MagicSearchPipe,
    PreviewComponent,
    RandomizePipe,
    ResFilter,
    ResolutionFilterPipe,
    TagsComponent,
    TopComponent,
    WordFrequencyPipe
  ],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    FormsModule,
    HttpModule,
    VirtualScrollModule
  ],
  providers: [
    ElectronService,
    FileSearchPipe,
    ResolutionFilterService,
    ShowLimitService,
    SimilarityService,
    TagsService,
    WordFrequencyService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
