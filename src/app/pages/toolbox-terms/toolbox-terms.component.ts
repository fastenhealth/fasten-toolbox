import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {ConnectApiService} from '../../services/connect-api.service';

type ToolboxTermsField = 'firstName' | 'lastName' | 'email';

@Component({
  selector: 'app-toolbox-terms',
  templateUrl: './toolbox-terms.component.html',
  styleUrls: ['./toolbox-terms.component.scss']
})
export class ToolboxTermsComponent {
  readonly signupForm: FormGroup;
  readonly logoSources = [
    { name: 'Aetna', path: '/assets/sources/aetna.png' },
    { name: 'Anthem', path: '/assets/sources/anthem.png' },
    { name: 'Cedars-Sinai', path: '/assets/sources/cedarssinai.png' },
    { name: 'Cleveland Clinic', path: '/assets/sources/cleveland-clinic.png' },
    { name: 'Duke Health', path: '/assets/sources/duke-health.png' },
    { name: 'Inova', path: '/assets/sources/inova-and-valley-health.png' },
    { name: 'Johns Hopkins Medicine', path: '/assets/sources/johns-hopkins-medicine.png' },
    { name: 'Kaiser Permanente', path: '/assets/sources/kaiser-permanente-california-northern.png' },
    { name: 'Mass General Brigham', path: '/assets/sources/mass-general-brigham.png' },
    { name: 'Mayo Clinic', path: '/assets/sources/mayo-clinic.png' },
    { name: 'NYU Langone', path: '/assets/sources/nyu-langone-medical-center.png' },
    { name: 'Stanford Health Care', path: '/assets/sources/stanford-health-care.png' },
    { name: 'Sutter Health', path: '/assets/sources/sutter-health.png' },
    { name: "Texas Children's", path: '/assets/sources/texas-childrens.png' },
    { name: 'Tufts Medicine', path: '/assets/sources/tufts-medicine.png' },
    { name: 'Stanford Medicine', path: '/assets/sources/stanford.png' },
    { name: 'Anthem Medicaid', path: '/assets/sources/anthem-medicaid.png' },
    { name: 'Community Health Network', path: '/assets/sources/community-health-network.png' },
    { name: 'Baylor Scott & White', path: '/assets/sources/baylor-scott-and-white.png' },
    { name: "Arkansas Children's", path: '/assets/sources/arkansas-childrens.png' },
    { name: 'Baptist Memorial Health Care', path: '/assets/sources/baptist-memorial-health-care.avif' },
    { name: 'Care New England', path: '/assets/sources/care-new-england.png' },
    { name: "Cook Children's", path: '/assets/sources/cook-childrens-health-care-system.png' },
    { name: 'Denver Health', path: '/assets/sources/denver-health.png' },
    { name: 'Dignity Health', path: '/assets/sources/dignityhealth.png' },
    { name: 'Aspirus Health', path: '/assets/sources/aspirus.png' },
    { name: 'Hackensack Meridian Health', path: '/assets/sources/hackensack-meridian-health.png' },
    { name: "Stanford Children's Health", path: '/assets/sources/stanford-childrens-health.png' },
    { name: 'Hartford HealthCare', path: '/assets/sources/hartford-healthcare.png' },
    { name: 'Kaiser Permanente Georgia', path: '/assets/sources/kaiser-permanente-georgia.png' },
    { name: 'Norton Healthcare', path: '/assets/sources/norton-healthcare.png' },
    { name: 'OCHIN', path: '/assets/sources/ochin.png' },
    { name: 'Fresenius Medical Care', path: '/assets/sources/fresenius-medical-care-north-america.png' },
    { name: "Rady Children's", path: '/assets/sources/rady-childrens.png' },
    { name: 'Renown Health', path: '/assets/sources/renown-barton-cvmc.png' },
    { name: "Seattle Children's", path: '/assets/sources/seattle-childrens-hospital.png' },
    { name: 'MultiCare Health System', path: '/assets/sources/multicare-health-system.png' },
    { name: 'ProHealth Care', path: '/assets/sources/prohealth-care.png' },
    { name: 'University Health', path: '/assets/sources/university-health-care-system.png' },
    { name: 'Valleywise Health', path: '/assets/sources/valleywise-health.png' },
  ];
  submitted = false;
  submitting = false;
  submissionError = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly connectApi: ConnectApiService,
  ) {
    this.signupForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(80)]],
      lastName: ['', [Validators.required, Validators.maxLength(80)]],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  submit(): void {
    if (this.signupForm.invalid || this.submitting) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.submissionError = '';
    this.connectApi.requestToolboxAccess(this.signupForm.getRawValue()).subscribe({
      next: () => {
        this.submitting = false;
        this.submitted = true;
      },
      error: () => {
        this.submitting = false;
        this.submissionError = 'We could not submit your request. Please try again.';
      },
    });
  }

  controlInvalid(controlName: ToolboxTermsField): boolean {
    const control = this.signupForm.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }
}
