import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ToolboxService} from '../../services/toolbox.service';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-medical-records-export-callback',
  templateUrl: './medical-records-export-callback.component.html',
  styleUrls: ['./medical-records-export-callback.component.scss']
})
export class MedicalRecordsExportCallbackComponent implements OnInit {

  hasError = false
  errorMsg = ""

  loading = true

  hasBundle = false
  bundle = ""

  bundleSyncStart = ""
  bundleSyncCurrent = ""

  generateBundleDownloadUrl = null
  generateBundleDownloadFilename = null

  constructor(
    private activatedRoute : ActivatedRoute,
    private toolboxService: ToolboxService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(values => {


      if (values['error']) {
        this.loading = false
        this.hasError = true
        let errorMsgLines = [
          'status=400',
          `error=${values["error"]}`,
          `error_description=${values["error_description"]}`,
          `request_id=${values["request_id"]}`
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
        ]
        this.errorMsg = errorMsgLines.join('\n')
        return
      }


      this.toolboxService.recordsExportCallback(values).subscribe((res) => {
        console.log(res)

        //get the current timestamp
        this.bundleSyncStart = new Date().toISOString()

        //make calls to the download endpoint every 10 seconds, until we get an error or a success payload
        let cancel = setInterval(() => {
          this.bundleSyncCurrent = new Date().toISOString()
          this.toolboxService.recordsExportContentUrl().subscribe((res) => {
            console.log(res)
            if(res.status == 'success' || res.status == 'failed'){
              clearInterval(cancel)
            }
            if(res.status == 'success') {
              //if success, the platform will provide a signed s3 download URL.
              // We will use this to download the bundle and present it to the user.
              let contentUrl = res.content_url


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
              ]
              this.errorMsg = errorMsgLines.join('\n')
            }

          }, (err) => {
            clearInterval(cancel)
            this.loading = false

            this.hasError = true
            let errorMsgLines = [
              `status=${err.status}`,
              `error=${err.error.error || err.error}`,
            ]
            this.errorMsg = errorMsgLines.join('\n')

          })
        }, 10000)

      })
    })
  }



}
