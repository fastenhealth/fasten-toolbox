import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ToolboxService} from '../../services/toolbox.service';

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

  constructor(
    private activatedRoute : ActivatedRoute,
    private toolboxService: ToolboxService,
  ) { }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(values => {

      if (values['error']) {
        this.hasError = true
        let errorMsgLines = [
          'status=400',
          `error=${values["error"]}`,
          `error_description=${values["error_description"]}`,
          `request_id=${values["request_id"]}`
        ]
        this.errorMsg = errorMsgLines.join('\n')
        return
      }


      this.toolboxService.recordsExportCallback(values).subscribe((res) => {
        console.log(res)

        //make calls to the download endpoint every 10 seconds, until we get an error or a success payload
        let cancel = setInterval(() => {
          this.toolboxService.recordsExportDownload().subscribe((res) => {
            console.log(res)
            if(res.data.status == 'success' || res.data.status == 'failed'){
              clearInterval(cancel)
            }

            if(res.data.status == 'success') {
              //if success, present the content and download link to the user

              this.hasBundle = true
              this.bundle = res.data.content
            } else if(res.data.status == 'failed') {
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

            this.hasError = true
            let errorMsgLines = [
              `status=${err.status}`,
              `error=${err.error.error}`,
            ]
            this.errorMsg = errorMsgLines.join('\n')

          })
        }, 10000)

      })
    })
  }

}
