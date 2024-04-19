import { Injectable } from '@angular/core';
declare var google: any;

@Injectable({
  providedIn: 'root'
})
export class PlacesService {

  constructor() { }

  getLocationDetails(lat: number, lng: number): Promise<any> {
    const geocoder = new google.maps.Geocoder();
    const latlng = { lat, lng };
    return new Promise((resolve, reject) => {
      geocoder.geocode({ 'location': latlng }, (results:any, status:any) => {
        if (status === 'OK') {
          if (results[0]) {
            resolve(results[0]);
          } else {
            reject('No results found');
          }
        } else {
          reject('Geocoder failed due to: ' + status);
        }
      });
    });
  }
}
