import { MapsAPILoader } from '@agm/core';
import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { LatLng } from 'src/app/models/lat-lng';
import { OrganizationAddressDetail } from 'src/app/models/organization-address-detail';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  constructor(private _data: DataService,
    private mapsAPILoader: MapsAPILoader) { }
  
  
    @Input() lat:any;
    @Input() lng:any;
    ngOnChanges(changes: SimpleChanges){
      console.log(changes,this.lat,this.lng)
   
    }
  
    @Output() getData: EventEmitter<OrganizationAddressDetail> = new EventEmitter<OrganizationAddressDetail>();
    
    sendBulkDataToComponent() {
      this.getData.emit(this.organizationAddressDetail);
    }
  
    tempAddress:LatLng = new LatLng();
    geoCoder: any;
  
    ngOnInit(): void {
      // this.lat = this.latitude;
      // this.lng = this.longitude;
      // this.setLatLng(this.lat, this.lng);
      // this.getCurrentLocation();
      // this.mapsAPILoader.load().then(() => {
      //   this.geoCoder = new google.maps.Geocoder;
      // });
      // console.log("Recieve From Address component  ===",this.customerAddress);
      // if(this.customerAddress!=null && (Constants.EMPTY_STRINGS.includes(this.customerAddress.lat) || Constants.EMPTY_STRINGS.includes(this.customerAddress.lng))){
      //   this.setCurrentLocation();
      // }else{
      //   this.lat=Number(this.customerAddress.lat);
      //   this.lng=Number(this.customerAddress.lng);
      //   this.getAddress(this.lat, this.lng);
      // }
    }
  
    ngOnDestroy(){
      // this.customerAddress = "";
    }
  
    // lat!: any;
    // lng!: any;
    zoom: number = 18;
    address: any='';
  
  
  
  
    // locateMe() {
     
    //     this.mapsAPILoader.load().then(() => {
    //       this.setCurrentLocation();
    //       this.geoCoder = new google.maps.Geocoder;
    //     });
    // }
  
    // @ViewChild("placesRef") placesRef !: GooglePlaceDirective;
    // getAddress(latitude: number, longitude: number) {
    //   // console.log("geo=====",this.geoCoder)
    //   debugger
    // if(this.geoCoder){
    //   this.geoCoder.geocode({ 'location': { lat: latitude, lng: longitude } }, (results: google.maps.GeocoderResult[], status: string) => {
    //     if (status === 'OK') {
    //       if (results[0]) {
    //         // console.log(this.placesRef);
            
           
    //         this.lat = latitude;
    //         this.lng = longitude;
    //         const addressComponents = results[0].address_components;
            
    //         // this.address = JSON.parse(JSON.stringify(this.address));
    //         var address=JSON.parse(JSON.stringify(results[0].formatted_address));
    //         this.address = address;
    //         this._data.isDelivered == 1;
    //         this._data.locationPermission = 1;
    //         // console.log("reset value", this._data.locationPermission)
    //         // console.log('Address Component:', this.address );
    //         addressComponents.forEach(component => {
    //           if (component.types.length > 0) {
    //             if (component.types[0] == 'postal_code') {
    //               this.tempAddress.pincode = component.long_name;
    //             }
    //             if (component.types[0] == 'administrative_area_level_2') {
    //               this.tempAddress.city = component.long_name;
    //             }
    //             // if (component.types[0] == 'locality') {
    //             //   this.tempAddress.city = component.long_name;
    //             // }
    //             if (component.types[0] == 'administrative_area_level_1') {
    //               this.tempAddress.state = component.long_name;
    //             }
    //             if (component.types[0] == 'country') {
    //               this.tempAddress.country = component.long_name;
    //             }
    //           }
    //         });
  
           
    //       //  this.newMethod();
    //         // this.mapClicked(latitude,longitude);
    //         if (this.tempAddress.latitude != undefined) {
    //           this.tempAddress.latitude = String(this.lat);
    //         }
    //         if (this.tempAddress.longitude != undefined) {
    //           this.tempAddress.longitude = String(this.lng);
    //         }
    //         // console.log('assdasda',this.address);
    //         this.sendBulkDataToComponent();
    //       }
         
    //     } else {
    //       //window.alert('Geocoder failed due to: ' + status);
    //     }
    //   });
    // }
    // }

    // getCurrentLocation(): Promise<{ latitude: number; longitude: number }> {
    //   return new Promise((resolve, reject) => {
    //     if (navigator.geolocation) {
    //       navigator.geolocation.getCurrentPosition(
    //         (position) => {
    //           this.lat = position.coords.latitude;
    //           this.lng = position.coords.longitude;
    //           // this.isShowMap = true;
    //           resolve({
    //             latitude: position.coords.latitude,
    //             longitude: position.coords.longitude,
    //           });
    //         },
    //         (err) => {
    //           reject(err);
    //         },
    //         {
    //           enableHighAccuracy: true,  // Precise location
    //         maximumAge: 0              // Prevent cached locations
    //         }
    //       );
    //     } else {
    //       reject('Geolocation is not supported by this browser.');
    //     }
    //   });
    // }
  
  
    // private setCurrentLocation() {
    //   if ("geolocation" in navigator) {
    //     navigator.geolocation.getCurrentPosition((position) => {
    //       this.lat = position.coords.latitude;
    //       this.lng = position.coords.longitude;
    //       this.setLatLng(this.lat, this.lng);
    //       // this.getAddress(this.lat, this.lng);
    //     });
    //   }
    // }
  
    organizationAddressDetail: OrganizationAddressDetail =
    new OrganizationAddressDetail();
    
    public handleAddressChange(e: any) {
       console.log('ghdm',e);
     debugger
      // this.lat = e.geometry.location.lat();
      // this.lng = e.geometry.location.lng();

      
      this.organizationAddressDetail = new OrganizationAddressDetail();
      this.organizationAddressDetail.longitude = this.newLng;
      this.organizationAddressDetail.latitude = this.newLat;

      this.organizationAddressDetail.addressLine1 = e.formatted_address;

    e?.address_components?.forEach((entry: any) => {
      // console.log(entry);

      if (entry.types?.[0] === 'route') {
        this.organizationAddressDetail.addressLine2 = entry.long_name + ',';
      }
      if (entry.types?.[0] === 'sublocality_level_1') {
        this.organizationAddressDetail.addressLine2 =
          this.organizationAddressDetail.addressLine2 + entry.long_name;
      }
      if (entry.types?.[0] === 'locality') {
        this.organizationAddressDetail.city = entry.long_name;
      }
      if (entry.types?.[0] === 'administrative_area_level_1') {
        this.organizationAddressDetail.state = entry.long_name;
      }
      if (entry.types?.[0] === 'country') {
        this.organizationAddressDetail.country = entry.long_name;
      }
      if (entry.types?.[0] === 'postal_code') {
        this.organizationAddressDetail.pincode = entry.long_name;
      }
    });


      this.setLatLng(this.organizationAddressDetail);
      // this.getAddress(this.lat, this.lng);
    }

    getAddressFromCoords(lat: number, lng: number): void {
      debugger
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results && results[0] ) {
          this.handleAddressChange(results[0]); 
        } else {
          console.error('Geocode was not successful for the following reason: ' + status);
        }
      });
    }
    
  
  centerChanged(event: any) {
    debugger
    // console.log(event,"========");
    this.newLat=event.lat;
    this.newLng=event.lng; 
    // this.getAddressFromCoords(this.newLat, this.newLng);
    // this.handleAddressChange(event);
    // this.setLatLng(this.organizationAddressDetail);
  }
  newLat:any;
  newLng:any
  
  mapReady(map:any) {
    // console.log("map=======",map);
  map.addListener("dragend", () => {
    this.lat=this.newLat;
    this.lng=this.newLng;
    this.getAddressFromCoords(this.newLat, this.newLng);
    // this.handleAddressChange(map);
    // console.log("999999",this.lat, this.lng);
    // this.setLatLng(this.organizationAddressDetail);
    //  this.getAddress(this.lat, this.lng);
    });
  }
  
  
  onZoomChange(event: number) {
    debugger
    // console.log('Zoom level changed:', event);
    this.lat=this.newLat;
    this.lng=this.newLng;
    this.getAddressFromCoords(this.newLat, this.newLng);
    // this.setLatLng(this.organizationAddressDetail);
    // this.setLatLng(this.lat, this.lng);
    // this.getAddress(this.lat, this.lng);
  }
  

  setLatLng(organizationAddressDetail : OrganizationAddressDetail){
    //  this.tempAddress.lat = lat;
    //  this.tempAddress.lng = lng;
     this.sendBulkDataToComponent();
  }
  }
  
  