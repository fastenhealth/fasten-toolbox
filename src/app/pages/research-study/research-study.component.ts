import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

interface ParticipantDetails {
  fullName: string;
  email: string;
  studyId: string;
}

@Component({
  selector: 'app-research-study',
  templateUrl: './research-study.component.html',
  styleUrls: ['./research-study.component.scss']
})
export class ResearchStudyComponent {
  @ViewChild('stitchElement') stitchElement?: ElementRef<any>;

  readonly studyForm: FormGroup;
  formSubmitted = false;
  participantSummary: ParticipantDetails | null = null;

  constructor(private readonly fb: FormBuilder) {
    this.studyForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      studyId: ['', Validators.required],
    });
  }

  get widgetMetadata(): string | null {
    if (!this.participantSummary) {
      return null;
    }

    return JSON.stringify({
      studyId: this.participantSummary.studyId,
      participantName: this.participantSummary.fullName,
      participantEmail: this.participantSummary.email,
    });
  }

  submitForm(): void {
    if (this.studyForm.invalid) {
      this.studyForm.markAllAsTouched();
      return;
    }

    const { fullName, email, studyId } = this.studyForm.value as ParticipantDetails;

    this.participantSummary = { fullName, email, studyId };
    this.formSubmitted = true;

    setTimeout(() => {
      const element = this.stitchElement?.nativeElement;
      if (element && typeof element.show === 'function') {
        element.show();
      }
    }, 0);
  }

  editDetails(): void {
    this.formSubmitted = false;
    this.participantSummary = null;
    this.studyForm.markAsPristine();
    this.studyForm.markAsUntouched();
  }

  controlInvalid(controlName: keyof ParticipantDetails): boolean {
    const control = this.studyForm.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }
}
