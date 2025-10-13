import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import {CmsService} from "../../services/cms.service";
import {ToolboxService} from "../../services/toolbox.service";
import { v4 as uuidv4 } from 'uuid';

interface HealthcareInstitution {
  id: string;
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
export class TefcaIasBetaComponent implements OnInit, OnDestroy, AfterViewInit {
  requestForm: FormGroup;
  searchForm: FormGroup;
  loading = false

  @ViewChild('stitchElement', { static: true }) stitchElement: ElementRef;

  private readonly destroy$ = new Subject<void>();

  readonly institutions: HealthcareInstitution[] = [
    { id:'', name: 'Massachusetts General Hospital', city: 'Boston', state: 'MA', zip: '02114' },
    { id:'', name: 'Mayo Clinic', city: 'Rochester', state: 'MN', zip: '55902' },
    { id:'', name: 'Cleveland Clinic', city: 'Cleveland', state: 'OH', zip: '44195' },
    { id:'', name: 'Cedars-Sinai Medical Center', city: 'Los Angeles', state: 'CA', zip: '90048' },
    { id:'', name: 'NYU Langone Health', city: 'New York', state: 'NY', zip: '10016' },
    { id:'', name: 'UCSF Medical Center', city: 'San Francisco', state: 'CA', zip: '94143' },
    { id:'', name: 'Houston Methodist Hospital', city: 'Houston', state: 'TX', zip: '77030' },
  ];

  filteredInstitutions: HealthcareInstitution[] = [...this.institutions];
  selectedInstitutions: HealthcareInstitution[] = [];
  submissionMessage = '';

  connections = [];

  external_id: string = uuidv4();

  constructor(private readonly fb: FormBuilder, private cmsService: CmsService, private toolboxService: ToolboxService, private renderer: Renderer2) {
    this.requestForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    });

    this.searchForm = this.fb.group({
      institutionSearch: [''],
    });
  }

  ngOnInit(): void {
    this.searchForm.valueChanges
      .pipe(debounceTime(200), takeUntil(this.destroy$))
      .subscribe(() => this.filterInstitutions());
  }

  ngAfterViewInit() {
    this.renderer.listen(this.stitchElement.nativeElement, 'eventBus', (event:any) => {
      console.warn("receiveStitchEventBus", event);

      let eventPayload = JSON.parse(event.detail.data)
      if(eventPayload.event_type == 'widget.complete') {
        console.log(eventPayload.event_type, this.connections);
        this.connections = eventPayload.data;
        if(this.connections && this.connections.length > 0){
          var firstConnection = this.connections[0];
          //redirect to the redirect.html file with these querystring parameters.
          const currentURL = window.location.href;
          var parsedURL = new URL(currentURL);
          var pathParts = parsedURL.pathname.split("/")
          pathParts.push("callback")
          parsedURL.pathname = pathParts.join("/")

          var params = new URLSearchParams(parsedURL.search);
          for(let key of Object.getOwnPropertyNames(firstConnection)){
            params.set(key, firstConnection[key]);
          }
          parsedURL.search = params.toString();

          //change the current window location to the new URL
          window.location.href = parsedURL.toString();
        }
      }

    });
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
    const institutionIds = this.selectedInstitutions.map(inst => inst.id);

    console.table({ fullName, email, institutions: institutionIds });
    this.loading = true
    this.toolboxService.tefcaIasBetaRequest({
      name: fullName,
      email: email,
      institution_ids: institutionIds,
      external_id:  this.external_id
    }).subscribe((response) => {
      this.loading = false
      this.stitchElement.nativeElement.show()
    }, (error) => {
      this.loading = false
      this.submissionMessage = 'There was an error submitting your request. Please try again later.';
      console.error('Error submitting request:', error);
    })

  }

  addInstitution(institution: HealthcareInstitution): void {
    const alreadySelected = this.selectedInstitutions.some(
      inst => inst.id === institution.id && inst.zip === institution.zip
    );

    if (!alreadySelected) {
      this.selectedInstitutions = [...this.selectedInstitutions, institution];
    }
  }

  removeInstitution(index: number): void {
    this.selectedInstitutions = this.selectedInstitutions.filter((_, idx) => idx !== index);
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
