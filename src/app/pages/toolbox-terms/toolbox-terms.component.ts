import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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
    { name: "Stanford Children's Health", path: '/assets/sources/stanford-childrens-health.png' },
    { name: 'Anthem Medicaid', path: '/assets/sources/anthem-medicaid.png' },
    { name: 'Community Health Network', path: '/assets/sources/community-health-network.png' },
    { name: 'Baylor Scott & White', path: '/assets/sources/baylor-scott-and-white.png' },
  ];
  submitted = false;

  constructor(private readonly fb: FormBuilder) {
    this.signupForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(80)]],
      lastName: ['', [Validators.required, Validators.maxLength(80)]],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  submit(): void {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.submitted = true;
  }

  controlInvalid(controlName: ToolboxTermsField): boolean {
    const control = this.signupForm.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }
}
