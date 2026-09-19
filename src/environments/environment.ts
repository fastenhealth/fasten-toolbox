// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  //javascript environment, not Fasten env.
  production: false,

  // is the application running in the cloud? (enables 3rd party IdP's and token based couchdb authentication)
  environment_cloud: false,

  // the environment name, `sandbox`, `prod`, `beta`
  environment_name: "sandbox",

  connect_api_endpoint_base: 'https://api.connect.fastenlabs.com/v1',
  records_export_public_id: 'public_test_f5ds5i5eiv0mv6ldpn8cl4x20cyh2xhw9zd78r46q20nz',

  platform_api_endpoint_base: 'https://api.platform.fastenlabs.com/v1',

};
