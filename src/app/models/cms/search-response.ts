export interface Store {
  ID: string;
  na: string; // Name
  gu: string; // URL
  de: string; // Description
  lat: string; // Latitude
  lng: string; // Longitude
  distance: string;
  dc: string; // Data Center
  st: string; // Street
  zp: string; // Zip Code
  ct: string; // City
  co: string; // Country
  rg: string; // Region
  ic: string; // Icon
  te: string; // Telephone
  mo: string; // Mobile
  fa: string; // Fax
  em: string; // Email
  we: string; // Website
  pr: string; // Priority
  rs: string; // Resource
  nt: string; // Notes
  ec: string; // Extra Code
  ci: string; // City Identifier
  rk: string; // Rank
}

export interface SearchResponse {
  stores: Store[];
  totalCount: number;
}
