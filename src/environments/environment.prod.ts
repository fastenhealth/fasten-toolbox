export const environment = {
  production: true,
  environment_cloud: false,
  environment_name: "prod",

  connect_api_endpoint_base: 'https://api.connect.fastenhealth.com/v1',
  records_export_public_id: 'public_live_0p9naei79dk4e1gbfoe4hhy4bhoj1ocmy4prdnnjwlmue',

  lighthouse_api_endpoint_base: 'https://lighthouse.fastenhealth.com/v1',

  //used to specify the couchdb server that we're going to use (can be relative or absolute). Must not have trailing slash
  couchdb_endpoint_base: '/database',

  //used to specify the api server that we're going to use (can be relative or absolute). Must not have trailing slash
  fasten_api_endpoint_base: '/api',
};
