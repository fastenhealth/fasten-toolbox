import {Component, OnInit} from '@angular/core';
import {LighthouseService} from '../../services/lighthouse.service';
import {LighthouseSourceMetadata} from '../../models/lighthouse/lighthouse-source-metadata';
import {Source} from '../../models/fasten/source';
import {getAccessTokenExpiration, jwtDecode} from 'fhirclient/lib/lib';
import BrowserAdapter from 'fhirclient/lib/adapters/BrowserAdapter';
import {MetadataSource} from '../../models/fasten/metadata-source';
import {ModalDismissReasons, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ActivatedRoute, Router} from '@angular/router';
import {Location} from '@angular/common';
import {ToastService} from '../../services/toast.service';
import {ToastNotification, ToastType} from '../../models/fasten/toast';
import {environment} from '../../../environments/environment';
import {forkJoin} from 'rxjs';
import Fuse from 'fuse.js'
import {ToolboxService} from '../../services/toolbox.service';
import {DomSanitizer} from '@angular/platform-browser';
// If you dont import this angular will import the wrong "Location"

export const sourceConnectWindowTimeout = 24*5000 //wait 2 minutes (5 * 24 = 120)

export class SourceListItem {
  source?: Source
  metadata: MetadataSource
}

@Component({
  selector: 'app-medical-sources',
  templateUrl: './medical-sources.component.html',
  styleUrls: ['./medical-sources.component.scss']
})
export class MedicalSourcesComponent implements OnInit {

  constructor(
    private lighthouseApi: LighthouseService,
    private toolboxApi: ToolboxService,
    private modalService: NgbModal,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private toastService: ToastService,
    private sanitizer: DomSanitizer
  ) { }


  environment_name = environment.environment_name
  status: { [name: string]: string } = {}
  loading: boolean = true

  metadataSources: {[name:string]: MetadataSource} = {}

  connectedSourceList: SourceListItem[] = [] //source's are populated for this list
  availableSourceList: SourceListItem[] = []

  bundle = null
  generateBundleDownloadUrl = null
  generateBundleDownloadFilename = null

  closeResult = '';
  modalSelectedSourceListItem:SourceListItem = null;

  searchIndex = null
  searchTerm: string = ""


  ngOnInit(): void {

    forkJoin([this.lighthouseApi.getLighthouseSourceMetadataMap()]).subscribe(results => {
      this.loading = false
      //handle source metadata map response
      this.metadataSources = results[0] as {[name:string]: MetadataSource}

      //handle sources
      for (const sourceType in this.metadataSources) {
        this.availableSourceList.push({metadata: this.metadataSources[sourceType]})
      }


      //check if we've just started connecting a "source_type"
      const callbackSourceType = this.route.snapshot.paramMap.get('source_type')
      if(callbackSourceType){
        this.status[callbackSourceType] = "token"

        //move this source from available to connected (with a progress bar)
        //remove item from available sources list, add to connected sources.
        let sourcesInProgress = this.availableSourceList.splice(this.availableSourceList.findIndex((item) => item.metadata.source_type == callbackSourceType), 1);

        //the structure of "availableSourceList" vs "connectedSourceList" sources is slightly different,
        //connectedSourceList contains a "source" field. The this.fastenApi.createSource() call in the callback function will set it.
        this.connectedSourceList.push(...sourcesInProgress)

        this.callback(callbackSourceType).then(console.log)
      }

      //setup Search
      const options = {
        // isCaseSensitive: false,
        // includeScore: false,
        // shouldSort: true,
        // includeMatches: false,
        findAllMatches: true,
        // minMatchCharLength: 1,
        // location: 0,
        // threshold: 0.6,
        // distance: 100,
        // useExtendedSearch: false,
        // ignoreLocation: false,
        // ignoreFieldNorm: false,
        // fieldNormWeight: 1,
        keys: [
          "metadata.display",
          "metadata.category",
          "metadata.source_type"
        ]
      };

      this.searchIndex = new Fuse(this.availableSourceList, options);


    }, err => {
      this.loading = false
    })
  }

  public searchTermChanged($event):void {
    this.searchTerm = $event.target.value
    console.log("search term changed:", )

    let searchResults
    if(this.searchTerm){
      searchResults = this.searchIndex.search(this.searchTerm).map((result) => {
        return result.item
      })
    }
    else {
      //emtpy search term, show all (original) values.
      searchResults = this.searchIndex.getIndex().docs
    }

    this.availableSourceList = searchResults
    console.log(this.availableSourceList)
  }

  /**
   * after pressing the logo (connectHandler button), this function will generate an authorize url for this source, and redirec the user.
   * @param $event
   * @param sourceType
   */
  public connectHandler($event: MouseEvent, sourceType: string):void {
    ($event.currentTarget as HTMLButtonElement).disabled = true;
    this.status[sourceType] = "authorize"

    this.lighthouseApi.getLighthouseSource(sourceType)
      .then(async (sourceMetadata: LighthouseSourceMetadata) => {
        console.log(sourceMetadata);
        let authorizationUrl = await this.lighthouseApi.generateSourceAuthorizeUrl(sourceType, sourceMetadata)

        console.log('authorize url:', authorizationUrl.toString());
        // redirect to lighthouse with uri's
        this.lighthouseApi.redirectWithOriginAndDestination(authorizationUrl.toString(), sourceType, sourceMetadata.redirect_uri)

      });
  }

  /**
   * if the user is redirected to this page from the lighthouse, we'll need to process the "code" to retrieve the access token & refresh token.
   * @param sourceType
   */
  public async callback(sourceType: string) {

    //get the source metadata again
    await this.lighthouseApi.getLighthouseSource(sourceType)
      .then(async (sourceMetadata: LighthouseSourceMetadata) => {

        //get required parameters from the URI and local storage
        const callbackUrlParts = new URL(window.location.href)
        const fragmentParams = new URLSearchParams(callbackUrlParts.hash.substring(1))
        const callbackCode = callbackUrlParts.searchParams.get("code") || fragmentParams.get("code")
        const callbackState = callbackUrlParts.searchParams.get("state") || fragmentParams.get("state")
        const callbackError = callbackUrlParts.searchParams.get("error") || fragmentParams.get("error")
        const callbackErrorDescription = callbackUrlParts.searchParams.get("error_description") || fragmentParams.get("error_description")

        //reset the url, removing the params and fragment from the current url.
        const urlTree = this.router.createUrlTree(["/sources"], {
          relativeTo: this.route,
        });
        this.location.replaceState(urlTree.toString());

        const expectedSourceStateInfo = JSON.parse(localStorage.getItem(callbackState))
        localStorage.removeItem(callbackState)

        if (callbackError && !callbackCode) {
          //TOOD: print this message in the UI
          console.error("an error occurred while authenticating to this source. Please try again later", callbackErrorDescription)
          return
        }

        console.log("callback code:", callbackCode)
        this.status[sourceType] = "token"

        let payload: any
        payload = await this.lighthouseApi.swapOauthToken(sourceType, sourceMetadata, expectedSourceStateInfo, callbackCode)


        //If payload.patient is not set, make sure we extract the patient ID from the id_token or make an introspection req
        if (!payload.patient && payload.id_token) {
          //
          console.log("NO PATIENT ID present, decoding jwt to extract patient")
          //const introspectionResp = await Oauth.introspectionRequest(as, client, payload.access_token)
          //console.log(introspectionResp)
          payload.patient = jwtDecode(payload.id_token, new BrowserAdapter())["profile"].replace(/^(Patient\/)/, '')
        }


        //Create FHIR Client

        const dbSourceCredential = new Source({
          source_type: sourceType,

          authorization_endpoint: sourceMetadata.authorization_endpoint,
          token_endpoint: sourceMetadata.token_endpoint,
          introspection_endpoint: sourceMetadata.introspection_endpoint,
          userinfo_endpoint: sourceMetadata.userinfo_endpoint,
          api_endpoint_base_url: sourceMetadata.api_endpoint_base_url,
          client_id: sourceMetadata.client_id,
          redirect_uri: sourceMetadata.redirect_uri,
          scopes_supported: sourceMetadata.scopes_supported,
          issuer: sourceMetadata.issuer,
          grant_types_supported: sourceMetadata.grant_types_supported,
          response_types_supported: sourceMetadata.response_types_supported,
          aud: sourceMetadata.aud,
          code_challenge_methods_supported: sourceMetadata.code_challenge_methods_supported,
          confidential: sourceMetadata.confidential,
          cors_relay_required: sourceMetadata.cors_relay_required,

          patient: payload.patient,
          access_token: payload.access_token,
          refresh_token: payload.refresh_token,
          id_token: payload.id_token,

          // @ts-ignore - in some cases the getAccessTokenExpiration is a string, which cases failures to store Source in db.
          expires_at: parseInt(getAccessTokenExpiration(payload, new BrowserAdapter())),
        })

        console.log("TODO: CREATE SOURCE + LOGIN PAGE")


        this.toolboxApi.exportSource(dbSourceCredential)
          .subscribe((resp) => {
            // const sourceSyncMessage = JSON.parse(msg) as SourceSyncMessage
            delete this.status[sourceType]
            // window.location.reload();
            // this.connectedSourceList.


            console.log("source bundle response:", resp)

            const toastNotification = new ToastNotification()
            toastNotification.type = ToastType.Success
            toastNotification.message = `Successfully exported FHIR bundle: ${sourceType}`

            this.toastService.show(toastNotification)

            this.bundle = resp

            let bundleJsonBlob = new Blob([JSON.stringify(this.bundle, null, 2)], { type: 'application/json' });
            this.generateBundleDownloadUrl = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(bundleJsonBlob));
            this.generateBundleDownloadFilename = `fasten-${sourceType}.bundle.json`



              //TODO: set the source bundle as a variable, display in the UI and allow users to download it.
          },
          (err) => {
            delete this.status[sourceType]
            // window.location.reload();

            const toastNotification = new ToastNotification()
            toastNotification.type = ToastType.Error
            toastNotification.message = `An error occurred while exporting FHIR bundle ${sourceType}: ${err}`
            toastNotification.autohide = false
            this.toastService.show(toastNotification)
            console.error(err)
          });
      })
  }
}
