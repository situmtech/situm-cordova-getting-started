import { Component } from '@angular/core';
import { NavController, NavParams, Platform, Events } from 'ionic-angular';

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

  constructor(public platform: Platform, public navCtrl: NavController, public navParams: NavParams, public events: Events) {
    this.building = this.navParams.get('building');
  }

  ionViewDidEnter() { }

  private startPositioning() {
    if (this.positioning == true) {
      console.log("Position listener is already enabled.");
      return;
    }
    let buildings = [{
      'buildingIdentifier': this.building.buildingIdentifier,
      'name': this.building.name
    }];
    //pass building object to start positioning
    this.positioning = true;

    // cordova.plugins.Situm.startPositioning(buildings, (res) => {
    //   this.position = res;
    //   console.log('Position updated: ' + JSON.stringify(res));
    // });
    this.initPositioning(buildings);

  }

  private initPositioning(buildings) {
    cordova.plugins.Situm.startPositioning(buildings, (res) => {
      return new Promise((resolve, reject) => {
        resolve(res);
      }).then((data: any) => {
        this.position = data;
        console.log(this.position);
      });
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

  ionViewWillLeave() {
    this.stopPositioning();
  }

}
