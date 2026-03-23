import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import QRCode from 'qrcode';
import { ToolboxService } from '../../services/toolbox.service';
import { SmartHealthLinkManifestCreateResponse } from '../../models/fasten/smart-health-link';

@Component({
  selector: 'app-patient-shared-health-document-modal',
  templateUrl: './patient-shared-health-document-modal.component.html',
  styleUrls: ['./patient-shared-health-document-modal.component.scss']
})
export class PatientSharedHealthDocumentModalComponent implements OnInit, OnDestroy {

  loading = true;
  errorMessage: string | null = null;
  qrCodeDataUrl: string | null = null;
  patientSharedHealthDocumentUrl: string | null = null;
  cardTitle = 'Patient Shared Health Document';
  patientName = '';
  patientDob = '';
  verifiedDate: string | null = null;

  private subscription: Subscription | null = null;

  constructor(
    private toolboxService: ToolboxService,
    public activeModal: NgbActiveModal
  ) {}

  ngOnInit(): void {
    this.fetchPatientSharedHealthDocument();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  fetchPatientSharedHealthDocument(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }

    this.loading = true;
    this.errorMessage = null;
    this.qrCodeDataUrl = null;

    this.subscription = this.toolboxService.shlinkManifestCreate()
      .subscribe({
        next: async (payload: SmartHealthLinkManifestCreateResponse) => {
          this.patientSharedHealthDocumentUrl = payload?.shlink || null;
          this.cardTitle = payload?.card_title || 'Patient Shared Health Document';
          this.patientName = payload?.patient_name || '';
          this.patientDob = payload?.patient_dob || '';
          this.verifiedDate = payload?.verified_at || null;

          if (this.patientSharedHealthDocumentUrl) {
            try {
              this.qrCodeDataUrl = await QRCode.toDataURL(this.patientSharedHealthDocumentUrl, {
                errorCorrectionLevel: 'M',
                margin: 2,
                width: 260
              });
            } catch (error) {
              console.error('Failed to generate QR code', error);
              this.errorMessage = 'Unable to generate QR code. Please try again.';
            }
          } else {
            this.errorMessage = 'No link was returned from the server.';
          }

          this.loading = false;
        },
        error: (err) => {
          console.error('Failed to generate Patient Shared Health Document', err);
          this.errorMessage = 'There was an issue generating the Patient Shared Health Document. Please try again later.';
          this.loading = false;
        }
      });
  }

  get formattedVerificationDate(): string {
    if (!this.verifiedDate) {
      return '';
    }

    const parsed = new Date(this.verifiedDate);
    if (Number.isNaN(parsed.getTime())) {
      return this.verifiedDate;
    }

    return parsed.toLocaleDateString('en-US');
  }
}
