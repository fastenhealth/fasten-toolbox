import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import QRCode from 'qrcode';
import { ToolboxService } from '../../services/toolbox.service';
import { SmartHealthLinkManifestCreateResponse } from '../../models/fasten/smart-health-link';

@Component({
  selector: 'app-smart-health-link-modal',
  templateUrl: './smart-health-link-modal.component.html',
  styleUrls: ['./smart-health-link-modal.component.scss']
})
export class SmartHealthLinkModalComponent implements OnInit, OnDestroy {

  loading = true;
  errorMessage: string | null = null;
  qrCodeDataUrl: string | null = null;
  smartHealthLinkUrl: string | null = null;
  cardTitle = "SMART Health Link";
  patientName = "";
  patientDob = "";
  verifiedDate: string | null = null;

  private subscription: Subscription | null = null;

  constructor(
    private toolboxService: ToolboxService,
    public activeModal: NgbActiveModal
  ) {}

  ngOnInit(): void {
    this.fetchSmartHealthLink();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  fetchSmartHealthLink(): void {
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
          this.smartHealthLinkUrl = payload?.shlink || null;
          this.cardTitle = payload?.card_title || 'SMART Health Link';
          this.patientName = payload?.patient_name || '';
          this.patientDob = payload?.patient_dob || '';
          this.verifiedDate = payload?.verified_at || null;

          if (this.smartHealthLinkUrl) {
            try {
              this.qrCodeDataUrl = await QRCode.toDataURL(this.smartHealthLinkUrl, {
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
          console.error('Failed to generate SMART Health Link', err);
          this.errorMessage = 'There was an issue generating the SMART Health Link. Please try again later.';
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
