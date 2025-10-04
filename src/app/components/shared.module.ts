import { ComponentsSidebarComponent } from './components-sidebar/components-sidebar.component';
import { NgModule } from '@angular/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { RouterModule } from '@angular/router';
import {BrowserModule} from '@angular/platform-browser';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { ToastComponent } from './toast/toast.component';
import { MomentModule } from 'ngx-moment';
import { TreeModule } from '@circlon/angular-tree-component';
import {FilterPipe} from '../pipes/filter.pipe';
import { ChartsModule } from 'ng2-charts';

@NgModule({
  imports: [
    RouterModule,
    BrowserModule,
    NgxDatatableModule,
    NgbModule,
    MomentModule,
    TreeModule,
    ChartsModule
  ],
  declarations: [
    ComponentsSidebarComponent,

    ToastComponent,
    FilterPipe,
  ],
    exports: [
        ComponentsSidebarComponent,
        ToastComponent,
        FilterPipe,

    ]
})

export class SharedModule { }
