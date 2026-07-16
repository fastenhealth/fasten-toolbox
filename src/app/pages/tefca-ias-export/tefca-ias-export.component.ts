import {AfterViewInit, Component, ElementRef, Renderer2, ViewChild} from '@angular/core';
import {environment} from '../../../environments/environment';

@Component({
  selector: 'app-tefca-ias-export',
  templateUrl: './tefca-ias-export.component.html',
  styleUrls: ['./tefca-ias-export.component.scss']
})
export class TefcaIasExportComponent implements AfterViewInit {

  @ViewChild('stitchElement') stitchElement: ElementRef;

  connections = [];
  environment = environment;
  showInstitutionSelector = false;
  loadingInstitutions = false;
  catalogError = '';
  private catalogApiMode = '';

  constructor(private renderer: Renderer2) { }

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
      this.redirectConnection(this.connections[0]);
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
        const params = new URLSearchParams({
          api_mode: this.catalogApiMode,
          public_id: environment.records_export_public_id,
        });
        const tefcaDirectoryId = connection.tefca_directory_id || connection.TEAdirectoryID;
        const brandId = connection.brand_id || connection.brandID;

        if (tefcaDirectoryId) {
          params.set('tefca_directory_id', tefcaDirectoryId);
        } else if (brandId) {
          params.set('brand_id', brandId);
        } else {
          throw new Error('Connection has no catalog identifier');
        }

        const response = await fetch(`${environment.connect_api_endpoint_base}/bridge/catalog?${params}`);
        const catalogEntry = await response.json();
        if (!response.ok || !catalogEntry.success || !catalogEntry.data?.name) {
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
    this.redirectConnection(this.connections[index]);
  }

  buildCallbackUrl(connection: any): string {
    const parsedURL = new URL(window.location.href);
    const pathParts = parsedURL.pathname.split('/');
    pathParts.push('callback');
    parsedURL.pathname = pathParts.join('/');

    const params = new URLSearchParams(parsedURL.search);
    for (const key of Object.getOwnPropertyNames(connection)) {
      if (key !== 'institutionName' && key !== 'institutionLocation' && key !== 'institutionLogo') {
        params.set(key, connection[key]);
      }
    }
    parsedURL.search = params.toString();

    return parsedURL.toString();
  }

  redirectConnection(connection: any): void {
    window.location.href = this.buildCallbackUrl(connection);
  }

  private hideStitchWidget(): void {
    const stitchElement = this.stitchElement.nativeElement as any;
    if (typeof stitchElement.hide === 'function') {
      stitchElement.hide();
    }
  }
}
