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
