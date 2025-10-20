export class RecordExport {
  status: 'success' | 'failed' | 'pending'
  content_url?: string
  download_links?: {
    export_type: 'fhir_bundle' | 'jsonl'
    content_type: string
    url: string
  }[]
}
