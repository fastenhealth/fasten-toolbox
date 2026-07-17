import {AfterViewInit, Component, ElementRef, Renderer2, ViewChild} from '@angular/core';
import {environment} from '../../../environments/environment';
import {ToolboxService} from '../../services/toolbox.service';

@Component({
  selector: 'app-medical-records-export',
  templateUrl: './medical-records-export.component.html',
  styleUrls: ['./medical-records-export.component.scss']
})
export class MedicalRecordsExportComponent implements AfterViewInit {

  @ViewChild('stitchElement') stitchElement: ElementRef;

  environment = environment;
  connections = [];
  showInstitutionSelector = false;
  loadingInstitutions = false;
  catalogError = '';

  private catalogApiMode = '';

  constructor(private renderer: Renderer2, private toolboxService: ToolboxService) { }

  ngAfterViewInit() {
    this.renderer.listen(this.stitchElement.nativeElement, 'eventBus', (event:any) => {
      this.onStitchEvent(event);
    });
  }

  onStitchEvent(event: any): void {
    const eventPayload = JSON.parse(event.detail.data);
    if (eventPayload.event_type !== 'widget.complete') {
      return;
    }

    this.connections = eventPayload.data || [];
    this.catalogApiMode = eventPayload.api_mode;

    if (this.connections.length === 1) {
      window.location.href = this.buildCallbackUrl(this.connections[0]);
    } else if (this.connections.length > 1) {
      this.hideStitchWidget();
      this.loadInstitutionNames();
    }
  }

  async loadInstitutionNames(): Promise<void> {
    this.catalogError = '';
    this.loadingInstitutions = true;

    try {
      if (!this.catalogApiMode) {
        throw new Error('Missing catalog lookup configuration');
      }

      await Promise.all(this.connections.map(async (connection: any) => {
        const brandId = connection.brand_id || connection.brandID;
        const catalogEntry = await this.toolboxService.getCatalogEntry(this.catalogApiMode, connection).toPromise();
        if (!catalogEntry.success || !catalogEntry.data?.name) {
          throw new Error('Could not load institution name');
        }

        connection.institutionName = catalogEntry.data.name;
        const location = catalogEntry.data.locations?.[0];
        connection.institutionLocation = catalogEntry.data.location ||
          [catalogEntry.data.city, catalogEntry.data.state].filter(Boolean).join(', ') ||
          [location?.city, location?.state].filter(Boolean).join(', ');
        connection.institutionLogo = catalogEntry.data.logo ||
          (brandId ? `https://cdn.fastenhealth.com/logos/sources/${brandId}.png` : null);
      }));

      this.showInstitutionSelector = true;
    } catch (error) {
      console.error('Could not load institution names', error);
      this.catalogError = 'We could not load the institution names. Please try again.';
    } finally {
      this.loadingInstitutions = false;
    }
  }

  selectConnection(index: number): void {
    window.location.href = this.buildCallbackUrl(this.connections[index]);
  }

  buildCallbackUrl(connection: any): string {
    const currentURL = window.location.href;
    const parsedURL = new URL(currentURL);
    const pathParts = parsedURL.pathname.split('/');
    pathParts.push('callback');
    parsedURL.pathname = pathParts.join('/');

    const params = new URLSearchParams(parsedURL.search);
    for (const key of Object.getOwnPropertyNames(connection)) {
      if (key !== 'institutionName' && key !== 'institutionLogo' && key !== 'institutionLocation') {
        params.set(key, connection[key]);
      }
    }
    parsedURL.search = params.toString();

    return parsedURL.toString();
  }

  private hideStitchWidget(): void {
    const stitchElement = this.stitchElement.nativeElement as any;
    if (typeof stitchElement.hide === 'function') {
      stitchElement.hide();
    }
  }
}
