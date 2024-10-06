import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ToolboxService} from '../../services/toolbox.service';

@Component({
  selector: 'app-medical-records-export-callback',
  templateUrl: './medical-records-export-callback.component.html',
  styleUrls: ['./medical-records-export-callback.component.scss']
})
export class MedicalRecordsExportCallbackComponent implements OnInit {

  constructor(
    private activatedRoute : ActivatedRoute,
    private toolboxService: ToolboxService,
  ) { }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(values => {
      this.toolboxService.recordsExportCallback(values).subscribe((res) => {
        console.log(res)

        //make calls to the download endpoint every 10 seconds, until we get an error or a success payload
        let cancel = setInterval(() => {
          this.toolboxService.recordsExportDownload().subscribe((res) => {
            console.log(res)
            if(res.data.status == 'success' || res.data.status == 'failed'){
              clearInterval(cancel)
            }

            //TODO: if success, present the content and download link to the user

            //TODO: if error present the error to the user
          }, (err) => {
            clearInterval(cancel)
          })
        }, 10000)

      })
    })
  }

}
