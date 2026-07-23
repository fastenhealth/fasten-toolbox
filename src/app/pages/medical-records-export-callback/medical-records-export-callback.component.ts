import { Component, OnDestroy, OnInit } from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {ToolboxService} from '../../services/toolbox.service';
import {DomSanitizer} from '@angular/platform-browser';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {SmartHealthLinkModalComponent} from '../smart-health-link-modal/smart-health-link-modal.component';
import {
  PatientSharedHealthDocumentModalComponent
} from "../patient-shared-health-document-modal/patient-shared-health-document-modal.component";

@Component({
  selector: 'app-medical-records-export-callback',
  templateUrl: './medical-records-export-callback.component.html',
  styleUrls: ['./medical-records-export-callback.component.scss']
})
export class MedicalRecordsExportCallbackComponent implements OnInit, OnDestroy {

  hasError = false
  errorMsg = ""

  loading = true

  hasBundle = false
  bundle = ""

  bundleSyncStart = ""
  bundleSyncCurrent = ""

  generateBundleDownloadUrl = null
  generateBundleDownloadFilename = null

  hasMultipleDownloadLinks: boolean = false
  private exportPoll: any
  private exportPollInFlight = false
  constructor(
    private activatedRoute : ActivatedRoute,
    private toolboxService: ToolboxService,
    private sanitizer: DomSanitizer,
    private modalService: NgbModal
  ) { }

  ngOnDestroy(): void {
    this.stopExportPolling()
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(values => {
      if (values['error']) {
        this.loading = false
        this.hasError = true
        let errorMsgLines = [
          'status=400',
          `error=${values["error"]}`,
          `error_description=${values["error_description"]}`,
          `request_id=${values["request_id"] || 'unavailable'}`,
          `connection_id=${values["org_connection_id"] || 'unavailable'}`
        ]
        this.errorMsg = errorMsgLines.join('\n')
        return
      } else if(!values['org_connection_id'] || values['org_connection_id'] == '') {
        this.loading = false
        this.hasError = true
        let errorMsgLines = [
          'status=400',
          `error=fasten_export_error`,
          `error_description=No connection id was provided. Please try again.`,
          `request_id=${values["request_id"] || 'unavailable'}`
        ]
        this.errorMsg = errorMsgLines.join('\n')
        return
      }


      this.toolboxService.recordsExportCallback(values).subscribe((res) => {
        console.log(res)

        //get the current timestamp
        this.bundleSyncStart = new Date().toISOString()
        this.bundleSyncCurrent = this.bundleSyncStart

        //check immediately, then poll until we get an error or a success payload
        const poll = () => {
          if (this.exportPollInFlight) {
            return
          }

          this.exportPollInFlight = true
          this.bundleSyncCurrent = new Date().toISOString()
          this.toolboxService.recordsExportContentUrl().subscribe((res) => {
            this.exportPollInFlight = false
            console.log(res)
            if(res.status == 'success' || res.status == 'failed'){
              this.stopExportPolling()
            }
            if(res.status == 'success') {
              //if success, the platform will provide a signed s3 download URL.
              // We will use this to download the bundle and present it to the user.
              let contentUrl = res.content_url
              this.hasMultipleDownloadLinks = (res.download_links || []).length > 1

              this.toolboxService.recordsExportDownloadContentUrl(contentUrl).subscribe((res) => {
                this.loading = false

                console.log("BUNDLE CONTENT", res)
                this.hasBundle = true

                //if the content is returned, we can set the bundle
                this.bundle = res

                let bundleJsonBlob = new Blob([this.bundle], { type: 'application/json' });
                this.generateBundleDownloadUrl = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(bundleJsonBlob));
                this.generateBundleDownloadFilename = `fasten-${values['endpoint_id']}.bundle.jsonl`

              })

            } else if(res.status == 'failed') {
              this.loading = false
              //if error present the error to the user
              this.hasError = true
              let errorMsgLines = [
                `status=400`,
                `error=fasten_export_error`,
                `error_description=An error occurred while exporting the records. Please try again later.`,
                `request_id=${values["request_id"] || 'unavailable'}`,
                `connection_id=${values["org_connection_id"] || 'unavailable'}`
              ]
              this.errorMsg = errorMsgLines.join('\n')
            }

          }, (err) => {
            this.exportPollInFlight = false
            this.stopExportPolling()
            this.loading = false

            this.hasError = true
            let errorMsgLines = [
              `status=${err.status}`,
              `error=${err.error.error || err.error}`,
              `request_id=${values["request_id"] || 'unavailable'}`,
              `connection_id=${values["org_connection_id"] || 'unavailable'}`
            ]
            this.errorMsg = errorMsgLines.join('\n')

          })
        }

        this.exportPoll = setInterval(poll, 5000)
        poll()

      }, (err) => {
        this.loading = false
        this.hasError = true
        this.errorMsg = [
          'status=' + err.status,
          `error=${err.error?.error || err.error || 'export_callback_error'}`,
          `request_id=${values["request_id"] || 'unavailable'}`,
          `connection_id=${values["org_connection_id"] || 'unavailable'}`
        ].join('\n')
      })
    })
  }

  private stopExportPolling(): void {
    if (this.exportPoll) {
      clearInterval(this.exportPoll)
      this.exportPoll = null
    }
  }

  onDownloadBundleFile(): void {
    console.debug('Download FHIR Bundle File option selected');
  }

  openSmartHealthLinkModal(): void {
    this.modalService.open(SmartHealthLinkModalComponent, { size: 'md', centered: true, backdrop: 'static' });
  }
  openPatientSharedHealthDocumentModal(): void {
    this.modalService.open(PatientSharedHealthDocumentModalComponent, { size: 'md', centered: true, backdrop: 'static' });
  }



}
