import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { BrowserModule } from "@angular/platform-browser";
import { Routes, RouterModule } from "@angular/router";
import {MedicalSourcesEditorComponent} from './pages/medical-sources-editor/medical-sources-editor.component';

const routes: Routes = [

  { path: '', redirectTo: '/editor', pathMatch: 'full' },
  { path: 'editor', component: MedicalSourcesEditorComponent },

  { path: '**', redirectTo: 'editor' },
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
