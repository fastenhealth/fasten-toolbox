import {Component, OnInit, ViewChild} from '@angular/core';
import {environment} from '../../../environments/environment';
import {LighthouseService} from '../../services/lighthouse.service';
import {BehaviorSubject} from 'rxjs';
import {MetadataSource} from '../../models/fasten/metadata-source';
import Handsontable from 'handsontable';
import { HotTableRegisterer } from '@handsontable/angular';
import {MedicalSourcesFilter} from '../../models/lighthouse/medical-sources-filter';
import {
  LighthouseBrandListDisplayItem,
  LighthouseSourceSearchResult
} from '../../models/lighthouse/lighthouse-source-search';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {debounceTime, distinctUntilChanged} from 'rxjs/operators';
import {ToolboxService} from '../../services/toolbox.service';
import {ToastNotification, ToastType} from '../../models/fasten/toast';
import {ToastService} from '../../services/toast.service';

@Component({
  selector: 'app-medical-sources-editor',
  templateUrl: './medical-sources-editor.component.html',
  styleUrls: ['./medical-sources-editor.component.scss']
})
export class MedicalSourcesEditorComponent implements OnInit {
  environment_name = environment.environment_name
  loading: boolean = false
  loading_submit: boolean = false

  brandsList: LighthouseBrandListDisplayItem[] = []

  //search
  searchFilter: MedicalSourcesFilter = new MedicalSourcesFilter()
  scrollComplete: boolean = false
  searchTermUpdate = new BehaviorSubject<string>("");

  //editor
  @ViewChild('editor') editor : any;
  selectedBrandForEditor: LighthouseBrandListDisplayItem = undefined
  brandEditorForm: FormGroup


  //table settings
  settings: Handsontable.GridSettings = {
    fixedColumnsStart: 1,
    // colWidths: 200,
    // autoColumnSize: true,
    columnSorting: false,

    autoRowSize: true,
    rowHeaders: true,
    rowHeights: 100,
    width: '100%',
    colHeaders: true,

    manualRowResize: true,
    manualColumnResize: true,
    selectionMode: 'single',

    afterSelection: (row, col, row2, col2, preventScrolling, selectionLayerLevel) => {
      console.log("SELECTION", row, col, row2, col2, preventScrolling, selectionLayerLevel)
      this.showEditorModal(this.brandsList[row])
    }

  }

  constructor(
    private lighthouseApi: LighthouseService,
    private toolboxApi: ToolboxService,
    private toastService: ToastService,
    private modalService: NgbModal,
  ) { }

  ngOnInit(): void {

    //register a callback for when the search box content changes
    this.searchTermUpdate
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
      )
      .subscribe(value => {
        console.log("search term changed:", value)
        let currentQuery = this.searchFilter.query || ""
        if(value != null && currentQuery != value){
          this.searchFilter.query = value
          this.resetSearch()
        }
      });

    this.loadMore()
  }

  public onScroll(): void {
    if(!this.scrollComplete) {
      this.loadMore()
    }
  }

  resetSearch(){
    this.scrollComplete = false
    this.searchFilter.searchAfter = undefined
    this.loadMore(true)
  }

  loadMore(reset: boolean = false){
    if(this.loading){
      //already loading, don't start another request
      return
    }

    this.loading = true
    this.searchFilter.fields = ["*"];
    this.lighthouseApi.searchLighthouseSources(this.searchFilter)
      .subscribe(wrapper => {
        this.loading = false
        console.log("RESULTS", wrapper)
        if (reset) {
          this.brandsList = wrapper?.hits?.hits?.map(hit => hit._source)
        } else {
          this.brandsList = this.brandsList.concat(wrapper?.hits?.hits?.map(hit => hit._source))
        }

        //check if scroll is complete.
        if(!wrapper?.hits || !wrapper?.hits?.hits || wrapper?.hits?.hits?.length == 0 || wrapper?.hits?.total?.value == wrapper?.hits?.hits?.length){
          console.log("SCROLL_COMPLETE!@@@@@@@@")
          this.scrollComplete = true;
        } else {
          //change the current Page (but don't cause a new query)
          console.log("SETTING NEXT SORT KEY:", wrapper.hits.hits[wrapper.hits.hits.length - 1].sort.join(','))
          this.searchFilter.searchAfter = wrapper.hits.hits[wrapper.hits.hits.length - 1].sort.join(",")
        }
      }, error => {
        this.loading = false
        console.log("ERROR", error)
      })
  }


  //Editor Functionality

  copyClipboard(event, portalName: string, endpointId: string, portalId: string, brandId: string){
    navigator.clipboard.writeText(`portal_name: "${portalName}"\nendpoint_id: ${endpointId}\nportal_id: ${portalId}\nbrand_id: ${brandId}`);

  }

  showEditorModal(rowData:LighthouseBrandListDisplayItem) {

    this.selectedBrandForEditor = rowData;
    console.log("SHOWING EDITOR MODAL", rowData)


    this.resetEditorForm(this.selectedBrandForEditor)

    this.modalService.open(this.editor, { size: 'lg' });
  }

  resetEditorForm(selectedBrand: LighthouseBrandListDisplayItem) {
    this.brandEditorForm = new FormGroup({
      brand_id: new FormControl(selectedBrand.id),
      name: new FormControl(selectedBrand.name),
      aliases: new FormArray([]),
      npi_numbers: new FormArray([]),
      brand_website: new FormControl(selectedBrand.brand_website),
      logo_website: new FormControl(null),
      logo_file: new FormGroup({
        file_name: new FormControl(null),
        file_size: new FormControl(null),
        file_content: new FormControl(null),
      }),
    })
  }

  get submitEnabled() {
    return this.brandEditorForm.valid
  }
  submit() {
    this.loading_submit = true

    let formData = this.brandEditorForm.value

    //we need to convert the form before submission
    //convert aliases
    formData.aliases = formData.aliases.map(alias => alias.alias)
    //convert npi_numbers
    formData.npi_numbers = formData.npi_numbers.map(npi => npi.npi)

    //only include fields that are "dirty"
    if(!this.brandEditorForm.get('brand_website').dirty){
     delete formData.brand_website
    }
    if(!this.brandEditorForm.get('logo_website').dirty){
      delete formData.logo_website
    }
    if(!this.brandEditorForm.get('name').dirty){
      delete formData.name
    }


    console.log("SUBMITTING", JSON.stringify(formData))
    this.toolboxApi.catalogEditor(formData).subscribe(
      response => {
        console.log("RESPONSE", response)
        this.loading_submit = false
        this.modalService.dismissAll()

        const toastNotification = new ToastNotification()
        toastNotification.type = ToastType.Success
        toastNotification.message = "Thanks for submitting your changes! A member of our team will review them shortly."
        this.toastService.show(toastNotification)
      },
      error => {
        console.log("ERROR", error)
        this.loading_submit = false

        const toastNotification = new ToastNotification()
        toastNotification.type = ToastType.Error
        toastNotification.message = "An error occurred while submitting your changes. Please try again later or contact support@fastenhealth.com"
        this.toastService.show(toastNotification)
      })
  }

  addLogoFile($event){
    console.log("onAttachmentFileChange")
    let fileInput = $event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files[0]) {
      let reader = new FileReader();
      reader.onloadend = () => {
        this.logo_file.get('file_content').setValue((reader.result as string))
      };
      reader.readAsDataURL(fileInput.files[0]);
      this.logo_file.get('file_name').setValue(fileInput.files[0].name)
      this.logo_file.get('file_size').setValue(fileInput.files[0].size)
    }
  }

  addAlias(newAliasTextbox: HTMLInputElement) {
    if (newAliasTextbox.value.length == 0) {
      return
    }
    this.aliases.push(new FormGroup({
      alias: new FormControl(newAliasTextbox.value)
    }))
    newAliasTextbox.value = ''
  }

  addNpiNumber(newNpiNumberTextbox: HTMLInputElement) {
    if (newNpiNumberTextbox.value.length == 0) {
      return
    }
    //make sure npi number is a number
    if (isNaN(Number(newNpiNumberTextbox.value))) {
      alert("NPI Number must be a number")
      return
    }
    this.npi_numbers.push(new FormGroup({
      npi: new FormControl(newNpiNumberTextbox.value)
    }))
    newNpiNumberTextbox.value = ''
  }

  get aliases(): FormArray<FormGroup> {
    return this.brandEditorForm.controls["aliases"] as FormArray;
  }

  get npi_numbers(): FormArray<FormGroup> {
    return this.brandEditorForm.controls["npi_numbers"] as FormArray;
  }

  get logo_file(): FormGroup {
    return this.brandEditorForm.controls["logo_file"] as FormGroup;
  }

  get logo_file_data_url(): string {
    let logo_file = this.brandEditorForm.controls["logo_file"] as FormGroup;
    return logo_file?.controls?.["file_content"]?.value
  }

  get logo_website(): string {
    return (this.brandEditorForm.controls["logo_website"] as FormControl).value;
  }

  get logo_brand_id(): string {
    return `https://cdn.fastenhealth.com/logos/sources/${this.selectedBrandForEditor.id}.png`
  }

  //helpers, HandsOnTable Renderers

  imageRender(instance, td, row, col, prop, value, cellProperties) {
    const img = document.createElement('img');

    img.src = `https://cdn.fastenhealth.com/logos/sources/${value}.png`;
    img.style.width = '100px';
    img.addEventListener('mousedown', event => {
      event.preventDefault();
    });

    img.addEventListener("error", function(event) {
      // @ts-ignore
      // event.target.parentNode.removeChild( event.target);

      event.target.src = 'https://cdn.fastenhealth.com/images/no-image.svg';

      // @ts-ignore
      event.onerror = null
    })

    td.innerText = '';
    td.appendChild(img);

    return td;
  }

  listRender(instance, td, row, col, prop, value, cellProperties) {
    const ulElement = document.createElement('ul');
    for (const item of value) {
      const liElement = document.createElement('li');
      liElement.innerText = item;
      ulElement.appendChild(liElement);
    }
    td.innerText = '';
    td.appendChild(ulElement);
    return td;
  }


  npiTypeahead: any = (query, process) => {

    this.lighthouseApi.searchMedicalContactIndividual(query).subscribe(results => {
      console.log("typeahead RESULTS", results)
      process(results)
    }, error => {
      console.log("typeahead ERROR", error)
    })
  }
}
