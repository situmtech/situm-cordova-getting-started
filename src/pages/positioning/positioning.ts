import { Component, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { NavController, NavParams, Platform, Events, LoadingController, ToastController } from 'ionic-angular';
import { DomSanitizer } from '@angular/platform-browser';
import { GoogleMaps, GoogleMap, GoogleMapsEvent, GoogleMapOptions, LatLng, ILatLng, GroundOverlayOptions, GroundOverlay, MarkerOptions, MarkerIcon, Marker, PolylineOptions, HtmlInfoWindow, Polyline } from '@ionic-native/google-maps';
import { MapButtonComponent } from '../../components/mapButton/mapButton';
import { PermissionsService } from '../../services/permissions';

declare var cordova: any;

const ROUTE_COLOR = '#754967';

// Positioning parameters
const defaultOptionsMap = {
  useDeadReckoning: false,
  interval: 1000,
  indoorProvider: 'INPHONE',
  useBle: true,
  useWifi: true, 
  motionMode: 'BY_FOOT',
  useForegroundService: true,
  outdoorLocationOptions: {
    continuousMode: true,
    userDefinedThreshold: false,
    burstInterval: 1,
    averageSnrThreshold: 25.0
  },
  beaconFilters: [],
  smallestDisplacement: 1.0,
  realtimeUpdateInterval: 1000
};

@Component({
  selector: 'page-positioning',
  templateUrl: 'positioning.html',
})

export class PositioningPage {

  building: any;

  positioning: boolean = false;

  position: any = {
    statusName: '',
    floorIdentifier: '',
    x: -1,
    y: -1,
    accuracy: -1,
    bearing: ''
  }

  floors: any[];
  currentFloor: any;

  map: GoogleMap;
  poiCategories: any[];
  marker: Marker;
  pois: any[];
  polyline: Polyline;

  accessible: boolean = false;
  navigating: boolean = false;
  route: any;

  constructor(
    public platform: Platform,
    public navCtrl: NavController,
    public navParams: NavParams,
    public events: Events,
    public detector: ChangeDetectorRef,
    public sanitizer: DomSanitizer,
    public loadingCtrl: LoadingController,
    public googleMaps: GoogleMaps,
    public toastCtrl: ToastController,
    private permissionsService : PermissionsService
  ) {
    this.building = this.navParams.get('building');
  }

  private showMap(event) {
    if (!this.map) {
      this.platform.ready().then(() => {
        // Shows a loading while the map is not displayed
        let loading = this.createLoading('Loading map...');
        loading.present();
        // Fetchs all floors of a building
        // More details in
        // http://developers.situm.es/sdk_documentation/cordova/jsdoc/1.3.10/symbols/Situm.html#.fetchFloorsFromBuilding
        cordova.plugins.Situm.fetchFloorsFromBuilding(this.building, (res) => {
          this.floors = res;
          this.currentFloor = res[0];

          this.mountMap();

          this.map.one(GoogleMapsEvent.MAP_READY).then(() => {
            this.mountOverlay(loading);
          }).catch((err: any) =>  this.handleError(err, loading));

        });
      });
    }
  }

  private mountMap() {
    let element = this.getElementById('map');
    let options: GoogleMapOptions = {
      camera: {
        target: this.getCenter(this.building),
        zoom: 20
      }
    };
    this.map = GoogleMaps.create(element, options);
  }

  private mountOverlay(loading) {
    let bounds = this.getBounds(this.building);
    let groundOptions: GroundOverlayOptions = {
      url: this.currentFloor.mapUrl,
      bounds: bounds,
      bearing: this.building.rotation * 180 / Math.PI
    }
    this.map.addGroundOverlay(groundOptions).then(() => {
      loading.dismiss();
    }).catch((err: any) => this.handleError(err, loading));
  }

  private showPois() {
    let loading = this.createLoading('Loading POIs...');
    loading.present();
    if (!this.map) {
      const message = 'The map must be visible in order to show the POIs';
      this.presentToast(message, 'bottom', null);
      return;
    }
    this.fetchForPOIs(this.building, loading);
  }

  private fetchForPOIs(building, loading) {
    // Fetching for a building's  indoor POIs
    // More details in 
    // http://developers.situm.es/sdk_documentation/cordova/jsdoc/1.3.10/symbols/Situm.html#.fetchIndoorPOIsFromBuilding
    cordova.plugins.Situm.fetchIndoorPOIsFromBuilding(building, (res: any) => {
      this.pois = res;
      if (this.pois.length == 0) {
        loading.dismiss();
        const message = 'This building has no POIs';
        this.presentToast(message, 'bottom', null);
        return;
      }
      this.detector.detectChanges();
      this.fetchForPOICategories(building, loading);
    });
  }

  private fetchForPOICategories(building, loading) {
    // Fetching for an user's POI categories
    // More details in 
    //http://developers.situm.es/sdk_documentation/cordova/jsdoc/1.3.10/symbols/Situm.html#.fetchPoiCategories
    cordova.plugins.Situm.fetchPoiCategories((res: any) => {
      this.poiCategories = res;
      this.drawPOIsOnMap();
      loading.dismiss();
    });
  }

  private drawPOIsOnMap() {
    this.pois.forEach(poi => {
      poi.category = this.findPOICategory(poi);
      let markerPosition: ILatLng = {
        lat: poi.coordinate.latitude,
        lng: poi.coordinate.longitude
      }
      let icon: MarkerIcon = {
        size: {
          height: 35,
          width: 35
        }
      }
      if (poi.category) icon.url = poi.category.icon_selected;

      let markerOptions: MarkerOptions = {
        icon: icon,
        position: markerPosition,
        title: `${poi.poiName}`,
      };
      this.createMarker(markerOptions, this.map, false);
    });
  }

  private findPOICategory(poi) {
    return this.poiCategories.find((poiCategory: any) => {
      return poiCategory.poiCategoryCode == poi.category
    });
  }

  private startPositioning() {
    this.permissionsService.checkLocationPermissions().then(permission => {
      console.log('Location permission?', permission);
      if (permission) {
        if (this.positioning == true) {
          const message = 'Position listener is already enabled.';
          this.presentToast(message, 'bottom', null);
          return;
        }
        this.platform.ready().then(() => {
          if (!this.map) {
            const message = 'The map must be visible in order to launch the positioning';
            this.presentToast(message, 'bottom', null);
            return;
          }
          const loading = this.createLoading('Positioning...');
          loading.present();
          this.createPositionMarker();
          const locationOptions = this.mountLocationOptions();
          
          // Set callback and starts listen onLocationChanged event
          // More details in 
          // http://developers.situm.es/sdk_documentation/cordova/jsdoc/1.3.10/symbols/Situm.html#.startPositioning
          cordova.plugins.Situm.startPositioning(locationOptions, (res: any) => {
            this.positioning = true;
            this.position = res;
            
            if (!this.position || !this.position.coordinate) return;
            let position = this.mountPositionCoords(this.position);
      
            // Update the navigation
            if (this.navigating) this.updateNavigation(this.position);
            this.marker.setPosition(position);
            loading.dismiss();
            this.detector.detectChanges();
    
          }, (err: any) => {
            let errorMessage = err.match("reason=(.*),")[1];
            this.stopPositioning(loading);
            console.log('Error when starting positioning.', err);
            const message = `Error when starting positioning. ${errorMessage}`;
            this.presentToast(message, 'bottom', null);
          });
        });
      } else {
        const message = `You must have the location permission granted for positioning.`
        this.presentToast(message, 'bottom', null);
      }
    }).catch(error => {
      console.log(error);
      const message = `Error when requesting for location permissions. ${error}`
      this.presentToast(message, 'bottom', null);
    });
    
  }

  private mountLocationOptions() {
    let locationOptions = new Array();
    locationOptions.push(this.building);
    defaultOptionsMap['buildingIdentifier'] = this.building.buildingIdentifier,
    locationOptions.push(defaultOptionsMap);
    return locationOptions;
  }

  private mountPositionCoords(position) : ILatLng {
    return {
      lat: position.coordinate.latitude,
      lng: position.coordinate.longitude
    };
  }

  private updateNavigation(position) {
    // Sends a position to the location manager for calculate the navigation progress
    cordova.plugins.Situm.updateNavigationWithLocation([position], function(error) {
      console.log(error);
    }, function (error) {
      console.log(error);
    });
  }

  private stopPositioning(loading) {
    if (this.positioning == false) {
      console.log("Position listener is not enabled.");
      if (loading) loading.dismiss();
      return;
    }
    cordova.plugins.Situm.stopPositioning(() => {
      if (this.marker) this.marker.remove();
      if (this.polyline) {
        this.polyline.remove();
        this.route = null;
      }
      this.positioning = false;
      this.detector.detectChanges();
      if (loading) loading.dismiss();
    });
  }

  private showRoute() {
    if (!this.map || (!this.pois || this.pois.length == 0) || !this.positioning) {
      const message = 'The map with the POIs must be visible and the positioning must be started in order to determine the route';
      this.presentToast(message, 'bottom', null);
      return;
    }

    if (this.route) {
      const message = 'The route is already painted on the map.';
      this.presentToast(message, 'bottom', null);
      return;
    }
    
    console.log("Position is: " + this.position.bearing.degrees);
    
    let directionsOptionsMap = {
      accesible: this.accessible, 
      startingAngle: this.position.bearing.degrees,
    };

    // Calculates a route between two points
    // In this case, determining route between the current position and the second POI
    // More details in
    // http://developers.situm.es/sdk_documentation/cordova/jsdoc/1.3.10/symbols/Situm.html#.requestDirections
    cordova.plugins.Situm.requestDirections([this.building, this.position, this.pois[0], directionsOptionsMap], (route: any) => {
      this.route = route;
      this.drawRouteOnMap(route);
      this.detector.detectChanges();
    }, (err: any) => {
      console.error(err);
      const message = `Error when drawing the route. ${err}`;
      this.presentToast(message, 'bottom', null);
      return;
    });
  }

  private drawRouteOnMap(route) {
    let polylineOptions: PolylineOptions = {
      color: ROUTE_COLOR,
      width: 4,
      points: []
    };
    route.points.forEach(point => {
      polylineOptions.points.push({
        lat: point.coordinate.latitude,
        lng: point.coordinate.longitude
      });
    });
    this.map.addPolyline(polylineOptions).then((polyline : Polyline) => {
      this.polyline = polyline;
    });
  }

  private updateAccessible() {
    console.log(`Accessibility status: ${this.accessible}`);
    this.accessible = !this.accessible;
    this.detector.detectChanges();
  }

  private createPositionMarker() {
    let defaultOptions: MarkerOptions = {
      position: { lat: 0, lng: 0 },
      title: 'Current position'
    };
    this.createMarker(defaultOptions, this.map, true);
  }

  private requestNavigation() {
    if (this.navigating) {
      const message = 'Navigation is already activated';
      this.presentToast(message, 'bottom', null);
      return;
    }
    // Adds a listener to receive navigation updates when the 
    // updateNavigationWithLocation method is called
    cordova.plugins.Situm.requestNavigationUpdates();
    this.navigating = true;
    const msg = 'Added a listener to receive navigation updates';
    this.presentToast(msg, 'bottom', null);
  }

  private removeNavigation() {
    if (!this.navigating) {
      const message = 'Navigation is already deactivated';
      this.presentToast(message, 'bottom', null);
      return;
    }
    // Removes the listener from navigation updates
    cordova.plugins.Situm.removeNavigationUpdates();
    this.navigating = false;
    const msg = 'Removed the listener from navigation updates';
    this.presentToast(msg, 'bottom', null);
  }

  private clearCache() {
    // Invalidate all the resources in the cache
    // More details in
    // http://developers.situm.es/sdk_documentation/cordova/jsdoc/1.3.10/symbols/Situm.html#.invalidateCache
    cordova.plugins.Situm.invalidateCache();
    const msg = `All resources in the cache have been invalidated.`
    this.presentToast(msg, 'bottom', null);
  }

  private stablishCache() {
    // Sets the maximum age of a cached response.
    // More details in 
    // http://developers.situm.es/sdk_documentation/cordova/jsdoc/1.3.10/symbols/Situm.html#.setCacheMaxAge
    const maxAge : number = 7000;
    cordova.plugins.Situm.setCacheMaxAge(maxAge);
    const msg = `The maximun age of cached responses has been set at ${maxAge} seconds.`
    this.presentToast(msg, 'bottom', null);
  }

  private createMarker(options : MarkerOptions, map, currentPosition) {
    map.addMarker(options).then((marker : Marker) => {
      if (currentPosition) {
        this.marker = marker;
        this.marker.showInfoWindow();
      }
    });
  }

  private handleError(error, loading) {
    if (loading) loading.dismiss();
  }

  private getElementById(id) : HTMLElement {
    return document.getElementById(id);
  }

  private createLoading(msg) {
    return this.loadingCtrl.create({
      content: msg
    });
  }

  private getBounds(building) {
    if (!building) return;
    let boundsSW: LatLng = new LatLng(building.bounds.southWest.latitude, building.bounds.southWest.longitude);
    let boundsNE: LatLng = new LatLng(building.bounds.northEast.latitude, building.bounds.northEast.longitude);
    return [
      { lat: building.bounds.southWest.latitude, lng: building.bounds.southWest.longitude },
      { lat: building.bounds.northEast.latitude, lng: building.bounds.northEast.longitude }
    ];
  }

  private getCenter(building) : LatLng {
    return new LatLng(building.center.latitude, building.center.longitude);
  }

  ionViewWillLeave() {
    this.stopPositioning(null);
  }

  presentToast(text, position, toastClass) {
    const toast = this.toastCtrl.create({
      message: text,
      duration: 3000,
      position: position,
      cssClass: toastClass ? toastClass : ''
    });
    toast.present();
  }

  mapHidden() {
    if (!this.map) return true;
    return false;
  }

  positioningStopped() {
    if (!this.positioning) return true;
    return false;
  }

  noPois() {
    if (!this.pois || this.pois.length == 0) return true;
    return false;
  }

  routeConditionsNotSet() {
    if (this.noPois() || this.mapHidden() || this.positioningStopped()) return true;
    return false;
  }

  navigationConditionsNotSet() {
    if (this.routeConditionsNotSet() || !this.route) return true;
    return false;
  }

}
