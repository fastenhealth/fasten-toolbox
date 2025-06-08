import {AfterViewInit, Component, ElementRef, HostListener, OnInit, Renderer2, ViewChild} from '@angular/core';

@Component({
  selector: 'app-medical-records-export',
  templateUrl: './medical-records-export.component.html',
  styleUrls: ['./medical-records-export.component.scss']
})
export class MedicalRecordsExportComponent implements OnInit, AfterViewInit {

  @ViewChild('stitchElement', { static: true }) stitchElement: ElementRef;

  connections = [];
  constructor(private renderer: Renderer2) { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.renderer.listen(this.stitchElement.nativeElement, 'eventBus', (event:any) => {
      console.warn("receiveStitchEventBus", event);

      let eventPayload = JSON.parse(event.detail.data)
      if(eventPayload.event_type == 'widget.complete') {
        console.log(eventPayload.event_type, this.connections);

        this.connections = eventPayload.data;
      } else if(eventPayload.event_type == 'widget.close') {
        console.log(eventPayload.event_type, this.connections);
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

}
