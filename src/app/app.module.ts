import 'zone.js/dist/zone-mix';
import 'reflect-metadata';
import 'polyfills';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

// DISABLE THIS LATER !!?!?!?!?!!!
// import { VirtualScrollModule } from 'angular2-virtual-scroll';

import { ElectronService } from './providers/electron.service';
import { FolderViewService } from 'app/components/pipes/folder-view.service';
import { ShowLimitService } from 'app/components/pipes/show-limit.service';
import { WordFrequencyService } from 'app/components/pipes/word-frequency.service';

import { AppComponent } from './app.component';
import { FilmstripComponent } from 'app/components/home/filmstrip.component';
import { HomeComponent } from './components/home/home.component';
import { PreviewComponent } from './components/home/preview.component';
import { TopComponent } from './components/home/top.component';

import { FileSearchPipe } from './components/pipes/file-search.pipe';
import { FolderArrowsPipe } from 'app/components/pipes/folder-arrows.pipe';
import { FolderViewPipe } from 'app/components/pipes/folder-view.pipe';
import { LengthPipe } from './components/pipes/length.pipe';
import { LimitPipe } from './components/pipes/show-limit.pipe';
import { MagicSearchPipe } from './components/pipes/magic-search.pipe';
import { WordFrequencyPipe } from 'app/components/pipes/word-frequency.pipe';

import { AppRoutingModule } from './app-routing.module';

@NgModule({
  declarations: [
    AppComponent,
    FileSearchPipe,
    FilmstripComponent,
    FolderArrowsPipe,
    FolderViewPipe,
    HomeComponent,
    LengthPipe,
    LimitPipe,
    MagicSearchPipe,
    PreviewComponent,
    TopComponent,
    WordFrequencyPipe
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AppRoutingModule,
    // VirtualScrollModule
  ],
  providers: [
    ElectronService,
    FolderViewService,
    ShowLimitService,
    WordFrequencyService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
