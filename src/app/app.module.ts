import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { ChartsModule } from 'ng2-charts';
import {SharedModule} from './components/shared.module';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome'
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { HighlightModule, HIGHLIGHT_OPTIONS } from 'ngx-highlightjs';
import { MomentModule } from 'ngx-moment';
import { HotTableModule } from '@handsontable/angular';
import { registerAllModules } from 'handsontable/registry';
import { MedicalSourcesEditorComponent } from './pages/medical-sources-editor/medical-sources-editor.component';
import {ImageFallbackDirective} from './directives/image-fallback.directive';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import {LoadingSpinnerComponent} from './components/loading-spinner/loading-spinner.component';

// register Handsontable's modules
registerAllModules();

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    LoadingSpinnerComponent,
    MedicalSourcesEditorComponent,
    ImageFallbackDirective,
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    FontAwesomeModule,
    SharedModule,
    AppRoutingModule,
    HttpClientModule,
    NgbModule,
    ChartsModule,
    NgxDropzoneModule,
    HighlightModule,
    MomentModule,
    HotTableModule,
    InfiniteScrollModule
  ],
  providers: [
    {
      provide: HIGHLIGHT_OPTIONS,
      useValue: {
        coreLibraryLoader: () => import('highlight.js/lib/core'),
        lineNumbersLoader: () => import('highlightjs-line-numbers.js'), // Optional, only if you want the line numbers
        languages: {
          json: () => import('highlight.js/lib/languages/json')
        },
      }
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(library: FaIconLibrary) {
    library.addIconPacks(fas, far);
  }
}
