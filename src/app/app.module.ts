import 'zone.js/dist/zone-mix';
import 'reflect-metadata';
import 'polyfills';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { PreviewComponent } from './components/home/preview.component';

import { FolderSearchPipe } from './components/pipes/folder-search.pipe';
import { FileSearchPipe } from './components/pipes/file-search.pipe';
import { MagicSearchPipe } from './components/pipes/magic-search.pipe';

import { AppRoutingModule } from './app-routing.module';

import { ElectronService } from './providers/electron.service';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    PreviewComponent,
    FolderSearchPipe,
    FileSearchPipe,
    MagicSearchPipe
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AppRoutingModule
  ],
  providers: [ElectronService],
  bootstrap: [AppComponent]
})
export class AppModule { }
