import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import {CmsService} from "../../services/cms.service";

interface HealthcareInstitution {
  name: string;
  city?: string;
  state?: string;
  zip?: string;
}

@Component({
  selector: 'app-tefca-ias-beta',
  templateUrl: './tefca-ias-beta.component.html',
  styleUrls: ['./tefca-ias-beta.component.scss']
})
export class TefcaIasBetaComponent implements OnInit, OnDestroy {
  requestForm: FormGroup;
  searchForm: FormGroup;

  private readonly destroy$ = new Subject<void>();

  readonly institutions: HealthcareInstitution[] = [
    { name: 'Massachusetts General Hospital', city: 'Boston', state: 'MA', zip: '02114' },
    { name: 'Mayo Clinic', city: 'Rochester', state: 'MN', zip: '55902' },
    { name: 'Cleveland Clinic', city: 'Cleveland', state: 'OH', zip: '44195' },
    { name: 'Cedars-Sinai Medical Center', city: 'Los Angeles', state: 'CA', zip: '90048' },
    { name: 'NYU Langone Health', city: 'New York', state: 'NY', zip: '10016' },
    { name: 'UCSF Medical Center', city: 'San Francisco', state: 'CA', zip: '94143' },
    { name: 'Houston Methodist Hospital', city: 'Houston', state: 'TX', zip: '77030' },
  ];

  filteredInstitutions: HealthcareInstitution[] = [...this.institutions];
  selectedInstitutions: HealthcareInstitution[] = [];
  submissionMessage = '';

  constructor(private readonly fb: FormBuilder, private cmsService: CmsService) {
    this.requestForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    });

    this.searchForm = this.fb.group({
      institutionSearch: [''],
      zipCode: [''],
    });
  }

  ngOnInit(): void {
    this.searchForm.valueChanges
      // .pipe(debounceTime(200), takeUntil(this.destroy$))
      .subscribe(() => this.filterInstitutions());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    if (this.requestForm.invalid || this.selectedInstitutions.length === 0) {
      this.requestForm.markAllAsTouched();
      this.submissionMessage = '';
      return;
    }

    const { fullName, email } = this.requestForm.value;
    const institutionNames = this.selectedInstitutions.map(inst => inst.name);

    this.submissionMessage = `Thanks ${fullName}! We\'ve noted your interest. A confirmation email will go to ${email}.`;
    console.table({ fullName, email, institutions: institutionNames });
  }

  addInstitution(institution: HealthcareInstitution): void {
    const alreadySelected = this.selectedInstitutions.some(
      inst => inst.name === institution.name && inst.zip === institution.zip
    );

    if (!alreadySelected) {
      this.selectedInstitutions = [...this.selectedInstitutions, institution];
    }
  }

  removeInstitution(index: number): void {
    this.selectedInstitutions = this.selectedInstitutions.filter((_, idx) => idx !== index);
  }

  addCustomInstitution(): void {
    const term = (this.searchForm.get('institutionSearch')?.value || '').trim();

    if (!term) {
      return;
    }

    const customInstitution = { name: term };
    this.addInstitution(customInstitution);
    this.searchForm.patchValue({ institutionSearch: '' });
  }

  private filterInstitutions(): void {
    const searchTerm = (this.searchForm.get('institutionSearch')?.value || '').toLowerCase().trim();
    const zipTerm = (this.searchForm.get('zipCode')?.value || '').toLowerCase().trim();

    this.cmsService.findHealthcareInstitution(searchTerm, zipTerm).subscribe((cmsInstitutions) => {
      console.log('CMS Institutions:', cmsInstitutions);

      //convert cmsInstitutions to HealthcareInstitution[]
      this.filteredInstitutions = cmsInstitutions.stores.map(store => ({
        id: store.ID,
        name: store.na,
        city: store.ct,
        state: store.rg,
        zip: store.zp,
      }));

    })

  }
}
