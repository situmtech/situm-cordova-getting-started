import { Component, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { NavController, NavParams, Platform, Events, LoadingController } from 'ionic-angular';
import { DomSanitizer } from '@angular/platform-browser';
import { GoogleMaps, GoogleMap, GoogleMapsEvent, GoogleMapOptions, LatLng, ILatLng, GroundOverlayOptions, GroundOverlay, MarkerOptions, MarkerIcon, Marker, PolylineOptions, HtmlInfoWindow } from '@ionic-native/google-maps';
import { MapButtonComponent } from '../../components/mapButton/mapButton';

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

  accessible: boolean = false;
  navigating: boolean = false;

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
          position: { lat: 0, lng: 0 },
          title: 'Current position'
        };
        this.map.addMarker(defaultOptions).then((marker: Marker) => {
          this.marker = marker;

          var locationOptions = new Array();
          locationOptions.push(this.building);

          var locationOptionsMap = new Object();
          locationOptionsMap["useDeadReckoning"] = false;
          locationOptionsMap["buildingIdentifier"] = this.building.buildingIdentifier;
          

          locationOptions.push(locationOptionsMap);


          cordova.plugins.Situm.startPositioning(locationOptions, (res: any) => {
            this.position = res;
            if (this.position.coordinate) {
              let position: ILatLng = {
                lat: this.position.coordinate.latitude,
                lng: this.position.coordinate.longitude
              };

              if (this.navigating) {
                console.log("Requesting navigation updates " + this.navigating);
                cordova.plugins.Situm.updateNavigationWithLocation([res], function(error) {
                  console.log(error);
                } , function (error) {
                  console.log(error);
                });
                console.log("Reached update with lcoation end");
              }
              this.marker.setPosition(position);
              this.detector.detectChanges();
            }
          }, (err: any) => {
            console.log(err);
          });
        });
      }
    });
  }

  private requestNavigation() {
    // var navigationOptions = [];
    cordova.plugins.Situm.requestNavigationUpdates();
    this.navigating = true;
  }

  private removeNav() {
    cordova.plugins.Situm.removeNavigationUpdates();
    this.navigating = false;
  }

  private clearCache() {
    console.log("invalidate cache js");
    cordova.plugins.Situm.invalidateCache();
  }

  private stablishCache() {
    console.log("set cache js");
    // var cacheMaxAgeOptions = new Object();
    // cacheMaxAgeOptions["maxAge"] = 10000

    cordova.plugins.Situm.setCacheMaxAge(7000);

    cordova.plugins.Situm.getCacheMaxAge();
    
  }

  private showRoute() {
    console.log("determining route between first and second poi");
    if (this.map && this.pois) {
      var directionsOptionsMap = new Object();
      directionsOptionsMap["accessible"] = this.accessible
      // if (this.position != null) {
      console.log("Position is: " + this.position.bearing.degrees);
      directionsOptionsMap["startingAngle"] = this.position.bearing.degrees; // Compute this 
      // }
      cordova.plugins.Situm.requestDirections([this.building, this.position.position, this.pois[2], directionsOptionsMap], (route: any) => {
        console.log(route);
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
      }, (err: any) => {
        console.error(err);
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
          let html = '<html><p>[innerHTML]="element.poiName"</p></html>';
          let infoWindow = new HtmlInfoWindow();
          infoWindow.setContent(html);
          this.map.addMarker(markerOptions).then((marker: Marker) => {
            marker.on(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {
              infoWindow.open(marker);
            });
          });
        });
      }
    });
  }

  private updateAccessible() {
    console.log('Accessible new state:' + this.accessible);
    this.accessible = !this.accessible;
  }

  private showMap(event) {
    if (!this.map) {
      this.platform.ready().then(() => {
        let loading = this.loadingCtrl.create({
          content: "Cargando mapa..."
        });
        loading.present();

        cordova.plugins.Situm.fetchFloorsFromBuilding(this.building, (res) => {
          this.floor = res[0];
          cordova.plugins.Situm.fetchMapFromFloor(this.floor, (res) => {
            console.log('Getting the floor map');
            console.log(res);
            console.log(this.floor.mapUrl);
            let floorMap : any = res.data;
            let element: HTMLElement = document.getElementById('map');
            let center: LatLng = new LatLng(this.building.center.latitude, this.building.center.longitude);
            let options: GoogleMapOptions = {
              camera: {
                target: center,
                zoom: 20
              }
            };
            this.map = GoogleMaps.create(element, options);
            this.map.one(GoogleMapsEvent.MAP_READY).then(() => {
              // loading.dismiss();
              let boundsSW: LatLng = new LatLng(this.building.bounds.southWest.latitude, this.building.bounds.southWest.longitude);
              let boundsNE: LatLng = new LatLng(this.building.bounds.northEast.latitude, this.building.bounds.northEast.longitude);
              let bounds = [
                { lat: this.building.bounds.southWest.latitude, lng: this.building.bounds.southWest.longitude },
                { lat: this.building.bounds.northEast.latitude, lng: this.building.bounds.northEast.longitude }
              ];
              console.log('Createndo ground overlay');
              let groundOptions: GroundOverlayOptions = {
                bounds: bounds,
                url: this.floor.mapUrl,
                bearing: this.building.rotation * 180 / Math.PI
              }
              this.map.addGroundOverlay(groundOptions).then(() => {
                loading.dismiss();
              }).catch((err: any) => {
                console.log('Intentando crear o ground overlay');
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
