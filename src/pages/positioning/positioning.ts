import { Component, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { NavController, NavParams, Platform, Events, LoadingController } from 'ionic-angular';
import { DomSanitizer } from '@angular/platform-browser';
import { GoogleMaps, GoogleMap, GoogleMapsEvent, GoogleMapOptions, LatLng, ILatLng, GroundOverlayOptions, GroundOverlay, MarkerOptions, MarkerIcon, Marker, PolylineOptions, HtmlInfoWindow } from '@ionic-native/google-maps';

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

  floor: any;

  map: GoogleMap;
  poiCategories: any[];
  marker: Marker;
  pois: any[];

  constructor(
    public platform: Platform,
    public navCtrl: NavController,
    public navParams: NavParams,
    public events: Events,
    public detector: ChangeDetectorRef,
    public sanitizer: DomSanitizer,
    public loadingCtrl: LoadingController,
    public googleMaps: GoogleMaps
  ) {
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
    this.platform.ready().then(() => {
      let buildings = [this.building];
      this.positioning = true;
      if (this.map) {
        let defaultOptions: MarkerOptions = {
          title: 'Current position'
        };
        this.map.addMarker(defaultOptions).then((marker: Marker) => {
          this.marker = marker;
          cordova.plugins.Situm.startPositioning(buildings, (res: any) => {
            this.position = res;
            if (this.position.coordinate) {
              let position: ILatLng = {
                lat: this.position.coordinate.latitude,
                lng: this.position.coordinate.longitude
              };
              this.marker.setPosition(position);
              this.detector.detectChanges();
            }
          });
        });
      }
    });
  }

  private showRoute() {
    if (this.map && this.pois) {
      cordova.plugins.Situm.requestDirections([this.pois[1], this.pois[2]], (route: any) => {
        let polylineOptions: PolylineOptions = {
          color: "#754967",
          width: 4,
          points: []
        };
        route.points.forEach(point => {
          polylineOptions.points.push({
            lat: point.coordinate.latitude,
            lng: point.coordinate.longitude
          });
        });
        this.map.addPolyline(polylineOptions);
      });
    }
  }

  private stopPositioning() {
    if (this.positioning == false) {
      console.log("Position listener is not enabled.");
      return;
    }
    this.positioning = false;
    if (this.marker) this.marker.remove();
    cordova.plugins.Situm.stopPositioning(() => { });
  }

  private showPois() {
    cordova.plugins.Situm.fetchIndoorPOIsFromBuilding(this.building, (res: any) => {
      this.pois = res;
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
            position: markerPosition
          };
          let html = "<html><b>Test html infowindow</b></html>";
          let infoWindow = new HtmlInfoWindow();
          infoWindow.setContent(html);
          console.log(GoogleMapsEvent.MARKER_CLICK);
          this.map.addMarker(markerOptions).then((marker: Marker) => {
            console.log(marker.getId());
            marker.on(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {
              console.log(infoWindow);
              console.log(marker);
              infoWindow.open(marker);
            });
          });
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
        cordova.plugins.Situm.fetchFloorsFromBuilding(this.building, (res) => {
          this.floor = res[0];
          cordova.plugins.Situm.fetchMapFromFloor(this.floor, (res) => {
            let element: HTMLElement = document.getElementById('map');
            let center: LatLng = new LatLng(this.building.center.latitude, this.building.center.longitude);
            let options: GoogleMapOptions = {
              camera: {
                target: center,
                zoom: 20
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
              let groundOptions: GroundOverlayOptions = {
                bounds: bounds,
                url: this.floor.mapUrl,
                bearing: this.building.rotation * 180 / Math.PI
              }
              this.map.addGroundOverlay(groundOptions).then(() => {
                loading.dismiss();
              }).catch((err: any) => {
                console.log(err);
                loading.dismiss();
              });
            }).catch((err: any) => {
              console.error(err);
              loading.dismiss();
            });
          });
        });
      });
    }
  }

  ionViewWillLeave() {
    this.stopPositioning();
  }

}
