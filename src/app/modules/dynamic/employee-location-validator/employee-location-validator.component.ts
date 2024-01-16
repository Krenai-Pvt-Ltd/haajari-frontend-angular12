import { Component, OnInit } from '@angular/core';
declare var google: any;
@Component({
  selector: 'app-employee-location-validator',
  templateUrl: './employee-location-validator.component.html',
  styleUrls: ['./employee-location-validator.component.css']
})

export class EmployeeLocationValidatorComponent implements OnInit {
  lat: number=0;
  lng: number=0;

  constructor() { }

  ngOnInit(): void {
    this.setCurrentLocation();
  }
  private setCurrentLocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;
        console.log(this.lat+"-"+this.lng);
        this.calculateDistance();
      });
    }
  }
  private calculateDistance(){
    var distance = google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(this.lat, this.lng), new google.maps.LatLng(0,0));       
    console.log(distance);
  }
}
