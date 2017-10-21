import 'zone.js/dist/zone-mix';
import 'reflect-metadata';
import 'polyfills';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { VirtualScrollModule } from 'angular2-virtual-scroll';

import { AppComponent } from './app.component';

import { FilmstripComponent } from 'app/components/home/filmstrip.component';
import { HomeComponent } from './components/home/home.component';
import { PreviewComponent } from './components/home/preview.component';
import { TopComponent } from './components/home/top.component';

import { FolderSearchPipe } from './components/pipes/folder-search.pipe';
import { FileSearchPipe } from './components/pipes/file-search.pipe';
import { MagicSearchPipe } from './components/pipes/magic-search.pipe';
import { LimitPipe } from './components/pipes/show-limit.pipe';
import { LengthPipe } from './components/pipes/length.pipe';

import { AppRoutingModule } from './app-routing.module';

import { ElectronService } from './providers/electron.service';

@NgModule({
  declarations: [
    AppComponent,
    FileSearchPipe,
    FilmstripComponent,
    FolderSearchPipe,
    HomeComponent,
    LengthPipe,
    LimitPipe,
    MagicSearchPipe,
    PreviewComponent,
    TopComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AppRoutingModule,
    VirtualScrollModule
  ],
  providers: [ElectronService],
  bootstrap: [AppComponent]
})
export class AppModule { }
