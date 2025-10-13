import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { BrowserModule } from "@angular/platform-browser";
import { Routes, RouterModule } from "@angular/router";
import {MedicalSourcesEditorComponent} from './pages/medical-sources-editor/medical-sources-editor.component';
import {MedicalRecordsExportComponent} from './pages/medical-records-export/medical-records-export.component';
import {
  MedicalRecordsExportCallbackComponent
} from './pages/medical-records-export-callback/medical-records-export-callback.component';
import { TefcaIasBetaComponent } from './pages/tefca-ias-beta/tefca-ias-beta.component';

const routes: Routes = [

  { path: '', component: MedicalSourcesEditorComponent, pathMatch: 'full' },
  { path: 'tefca/export', component: TefcaIasBetaComponent },
  { path: 'tefca/export/callback', component: MedicalRecordsExportCallbackComponent },
  { path: 'catalog/editor', component: MedicalSourcesEditorComponent },
  { path: 'records/export', component: MedicalRecordsExportComponent },
  { path: 'records/export/callback', component: MedicalRecordsExportCallbackComponent },

  { path: '**', redirectTo: 'catalog/editor' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
    CommonModule,
    BrowserModule,
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
