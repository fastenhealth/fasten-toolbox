import {AfterViewInit, Component, ElementRef, OnInit, Renderer2, ViewChild} from '@angular/core';
import {
  buildCallbackUrl,
  ExportConnection,
  providerDetails,
  providerDisplayName
} from '../export-provider-selection';

@Component({
  selector: 'app-tefca-ias-export',
  templateUrl: './tefca-ias-export.component.html',
  styleUrls: ['./tefca-ias-export.component.scss']
})
export class TefcaIasExportComponent implements OnInit, AfterViewInit {

  @ViewChild('stitchElement', { static: true }) stitchElement: ElementRef;

  connections: ExportConnection[] = [];
  showProviderSelection = false;

  constructor(private renderer: Renderer2) { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.renderer.listen(this.stitchElement.nativeElement, 'eventBus', (event:any) => {
      console.warn("receiveStitchEventBus", event);

      const eventPayload = JSON.parse(event.detail.data)
      if(eventPayload.event_type === 'widget.complete') {
        console.log(eventPayload.event_type, this.connections);
        this.handleWidgetComplete(eventPayload.data);
      }

    });
  }

  handleWidgetComplete(connections: ExportConnection[]): void {
    this.connections = Array.isArray(connections) ? connections : [];
    this.showProviderSelection = this.connections.length > 1;

    if (this.connections.length === 1) {
      this.selectProvider(this.connections[0]);
    }
  }

  selectProvider(connection: ExportConnection): void {
    window.location.href = buildCallbackUrl(window.location.href, connection);
  }

  providerDisplayName(connection: ExportConnection, index: number): string {
    return providerDisplayName(connection, index);
  }

  providerDetails(connection: ExportConnection): string {
    return providerDetails(connection);
  }

}
