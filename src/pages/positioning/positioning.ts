import { Component, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { NavController, NavParams, Platform, Events, LoadingController } from 'ionic-angular';
import { DomSanitizer } from '@angular/platform-browser';
import { GoogleMaps, GoogleMap, GoogleMapsEvent, GoogleMapOptions, LatLng, ILatLng, GroundOverlayOptions, GroundOverlay, MarkerOptions, MarkerIcon } from '@ionic-native/google-maps';
import { File, IWriteOptions } from '@ionic-native/file'

/**
 * Generated class for the PositioningPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

declare var cordova: any;

@Component({
  selector: 'page-positioning',
  templateUrl: 'positioning.html',
})
export class PositioningPage {

  building: any;

  buildingIdentifier: string = '';

  buildingName: string = '';

  positioning: boolean = false;

  position: any = {
    statusName: '',
    floorIdentifier: '',
    x: -1,
    y: -1,
    accuracy: -1,
    bearing: ''
  }

  image: Blob;
  map: any;
  poiCategories: any[];

  constructor(public platform: Platform, public navCtrl: NavController, public navParams: NavParams, public events: Events, public detector: ChangeDetectorRef,
    public sanitizer: DomSanitizer, public loadingCtrl: LoadingController, public googleMaps: GoogleMaps, public file: File) {
    this.building = this.navParams.get('building');
  }

  ionViewDidEnter() {
    this.platform.ready().then(() => {
      // cordova.plugins.Situm.fetchIndoorPOIsFromBuilding(this.building, (res: any) => {
      //   console.log(res);
      //   cordova.plugins.Situm.requestDirections([res[0], res[1]], (res) => {
      //     console.log(res);
      //   });
      // });
      // cordova.plugins.Situm.fetchOutdoorPOIsFromBuilding(this.building, (res: any) => {
      //   console.log(res);
      // });
      // cordova.plugins.Situm.fetchEventsFromBuilding(this.building, (res: any) => {
      //   console.log(res);
      // });
      cordova.plugins.Situm.fetchPoiCategories((res: any) => {
        this.poiCategories = res;
      });
    });
  }

  private startPositioning() {
    if (this.positioning == true) {
      console.log("Position listener is already enabled.");
      return;
    }
    let buildings = [{
      'buildingIdentifier': this.building.buildingIdentifier,
      'name': this.building.name
    }];
    this.positioning = true;

    cordova.plugins.Situm.startPositioning(buildings, (res: any) => {
      this.position = res;
      this.detector.detectChanges();
    });
  }

  private stopPositioning() {
    if (this.positioning == false) {
      console.log("Position listener is not enabled.");
      return;
    }
    this.positioning = false;
    cordova.plugins.Situm.stopPositioning(() => { });
  }

  private showPois() {
    cordova.plugins.Situm.fetchIndoorPOIsFromBuilding(this.building, (res: any) => {
      if (this.poiCategories && this.map) {
        res.forEach(element => {
          let category = this.poiCategories.find((poiCategory: any) => {
            return poiCategory.poiCategoryCode == element.category
          });
          element.category = category;
          let markerPosition: ILatLng = {
            lat: element.coordinate.latitude,
            lng: element.coordinate.longitude
          }
          let icon: MarkerIcon = {
            url: element.category.icon_selected,
            size: {
              height: 35,
              width: 35
            }
          }
          let markerOptions: MarkerOptions = {
            icon: icon,
            position: markerPosition,

          };
          this.map.addMarker(markerOptions);
          console.log(element);
        });
      }
    });
  }

  private showMap() {
    if (!this.map) {
      this.platform.ready().then(() => {
        let loading = this.loadingCtrl.create({
          content: "Cargando mapa..."
        });
        loading.present();
        console.log(this.building);
        cordova.plugins.Situm.fetchFloorsFromBuilding(this.building, (res) => {
          let floor = res[0];
          cordova.plugins.Situm.fetchMapFromFloor(floor, (res) => {
            this.image = this.b64toBlob(res.data, "image/png", 512);
            let imageOptions: IWriteOptions = {
              replace: true
            }
            let element: HTMLElement = document.getElementById('map');
            let center: LatLng = new LatLng(this.building.center.latitude, this.building.center.longitude);
            let options: GoogleMapOptions = {
              camera: {
                target: center,
                zoom: 19
              }
            };
            this.map = this.googleMaps.create(element, options);
            this.map.one(GoogleMapsEvent.MAP_READY).then(() => {
              // loading.dismiss();
              let boundsSW: LatLng = new LatLng(this.building.bounds.southWest.latitude, this.building.bounds.southWest.longitude);
              let boundsNE: LatLng = new LatLng(this.building.bounds.northEast.latitude, this.building.bounds.northEast.longitude);
              let bounds = [
                { lat: this.building.bounds.southWest.latitude, lng: this.building.bounds.southWest.longitude },
                { lat: this.building.bounds.northEast.latitude, lng: this.building.bounds.northEast.longitude }
              ];
              this.file.writeFile(this.file.externalApplicationStorageDirectory + "files", "mapa.png", this.image, imageOptions).then(() => {
                let groundOptions: GroundOverlayOptions = {
                  bounds: bounds,
                  url: this.file.externalApplicationStorageDirectory + "files/mapa.png",
                  bearing: this.building.rotation * 180 / Math.PI
                }
                this.map.addGroundOverlay(groundOptions).then(() => {
                  loading.dismiss();
                }).catch((err: any) => {
                  console.log(err);
                });
              }).catch((err: any) => {
                console.log(err);
              });
            });
          });
        });
      });
    }
  }

  ionViewWillLeave() {
    this.stopPositioning();
  }

  // convert base64 to Blob
  b64toBlob(b64Data, contentType, sliceSize) {
    let byteCharacters = atob(b64Data);

    let byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      let slice = byteCharacters.slice(offset, offset + sliceSize);

      let byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      let byteArray = new Uint8Array(byteNumbers);

      byteArrays.push(byteArray);

    }

    let blob = new Blob(byteArrays, { type: contentType });

    return blob;
  }

}
