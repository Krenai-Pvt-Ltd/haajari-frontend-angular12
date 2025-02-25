// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebase: {
    apiKey: 'AIzaSyDjRrxhbBNOUtNEj86naoIYZY_fD7mkzNo',
    authDomain: 'hajiri-staging.firebaseapp.com',
    databaseURL: 'https://hajiri-staging-default-rtdb.firebaseio.com',
    projectId: 'hajiri-staging',
    storageBucket: 'hajiri-staging.appspot.com',
    messagingSenderId: '348840816295',
    appId: '1:348840816295:web:3d2e8b3d76b6e30cb9f582',
    measurementId: 'G-4FFXG89F6R',
  },
};

export const RAZOR_PAY_KEY: string = 'rzp_test_Wd1RYd0fng3673';

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

   export const BASE_URL = 'http://localhost:8082/api/v2';

// /* ------------------  Staging urls ----------------*/
// export const BASE_URL = 'https://staging.hajiri.work/api/v2';

/* ------------------  Production urls ----------------*/
// export const BASE_URL = 'https://production.hajiri.work/api/v2';


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/*
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
