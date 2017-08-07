import { Component, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { NavController, NavParams, Platform, Events, LoadingController } from 'ionic-angular';
import { DomSanitizer } from '@angular/platform-browser';

/**
 * Generated class for the PositioningPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

declare var cordova: any;
declare var google: any;

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

  image: any;

  @ViewChild('map') mapElement: ElementRef;
  map: any;

  constructor(public platform: Platform, public navCtrl: NavController, public navParams: NavParams, public events: Events, public detector: ChangeDetectorRef,
    public sanitizer: DomSanitizer, public loadingCtrl: LoadingController) {
    this.building = this.navParams.get('building');
  }

  ionViewDidEnter() {
    this.platform.ready().then(() => {
      cordova.plugins.Situm.fetchIndoorPOIsFromBuilding(this.building, (res: any) => {
        console.log(res);
      });
      cordova.plugins.Situm.fetchOutdoorPOIsFromBuilding(this.building, (res: any) => {
        console.log(res);
      });
      cordova.plugins.Situm.fetchEventsFromBuilding(this.building, (res: any) => {
        console.log(res);
      });
      cordova.plugins.Situm.fetchPoiCategories((res: any) => {
        console.log(res);
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

  private showMap() {
    if (!this.map) {
      let loading = this.loadingCtrl.create({
        content: "Cargando mapa..."
      });
      loading.present();
      cordova.plugins.Situm.fetchFloorsFromBuilding(this.building, (res) => {
        let floor = res[0];
        cordova.plugins.Situm.fetchMapFromFloor(floor, (res) => {
          this.image = this.sanitizer.bypassSecurityTrustResourceUrl("data:image/png;base64," + res.data);
          let latlng = new google.maps.LatLng(this.building.center.latitude, this.building.center.longitude);

          let mapOptions = {
            center: latlng,
            zoom: 18,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            heading: this.building.rotation
          };

          let mapEle = this.mapElement.nativeElement;

          this.map = new google.maps.Map(mapEle, mapOptions);
          google.maps.event.addListenerOnce(this.map, 'idle', () => {
            loading.dismiss();
          });
          let boundsNE = new google.maps.LatLng(this.building.bounds.northEast.latitude, this.building.bounds.northEast.longitude);
          let boundsSW = new google.maps.LatLng(this.building.bounds.southWest.latitude, this.building.bounds.southWest.longitude);
          let boundsOverlay = new google.maps.LatLngBounds(boundsSW, boundsNE);
          let overlay = new google.maps.GroundOverlay(floor.mapUrl, boundsOverlay);
          overlay.setMap(this.map);
        });
      });
    }
  }

  ionViewWillLeave() {
    this.stopPositioning();
  }

}
