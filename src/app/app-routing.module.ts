import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { BrowserModule } from "@angular/platform-browser";
import { Routes, RouterModule } from "@angular/router";
import {MedicalSourcesEditorComponent} from './pages/medical-sources-editor/medical-sources-editor.component';
import {MedicalRecordsExportComponent} from './pages/medical-records-export/medical-records-export.component';
import {
  MedicalRecordsExportCallbackComponent
} from './pages/medical-records-export-callback/medical-records-export-callback.component';
import {AdminDashboardComponent} from './pages/admin-dashboard/admin-dashboard/admin-dashboard.component';
import {ConsentMetricsComponent} from './pages/admin-dashboard/consent-metrics/consent-metrics.component';
import {CollectMetricsComponent} from './pages/admin-dashboard/collect-metrics/collect-metrics.component';
import {PaymentMetricsComponent} from './pages/admin-dashboard/payment-metrics/payment-metrics.component';

const routes: Routes = [

  { path: '', redirectTo: '/catalog/editor', pathMatch: 'full' },
  { path: 'catalog/editor', component: MedicalSourcesEditorComponent },
  { path: 'records/export', component: MedicalRecordsExportComponent },
  { path: 'records/export/callback', component: MedicalRecordsExportCallbackComponent },
  {
    path: 'admin',
    component: AdminDashboardComponent,
    children: [
      { path: '', redirectTo: 'consent', pathMatch: 'full' },
      { path: 'consent', component: ConsentMetricsComponent },
      { path: 'collect', component: CollectMetricsComponent },
      { path: 'payment', component: PaymentMetricsComponent },
    ],
  },

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
