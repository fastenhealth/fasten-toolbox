import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { BrowserModule } from "@angular/platform-browser";
import { Routes, RouterModule } from "@angular/router";
import { MedicalSourcesComponent } from './pages/medical-sources/medical-sources.component';

const routes: Routes = [

  { path: '', redirectTo: '/export', pathMatch: 'full' },
  { path: 'export', component: MedicalSourcesComponent },
  { path: 'export/callback/:source_type', component: MedicalSourcesComponent },


  { path: '**', redirectTo: 'export' },
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
