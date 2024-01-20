export class MedicalSourcesFilter {
  //primary search terms (changes here should restart the search completely)
  query: string;

  //secondary search terms/facets (changes here should restart pagination)
  platformTypes: string[] = [];
  categories: string[] = [];
  showHidden: boolean = false;

  //pagination - this is the current page (changes here should be ignored)
  searchAfter: string | string[] = '';

  fields: string[] = []; //specify the fields to return. if null or empty list, return all.
}
