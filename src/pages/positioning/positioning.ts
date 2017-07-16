import { Component } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';

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

  buildingId : string = '';

  buildingName : string = '';

  positioning : boolean = false;

  position: any = {
    status_name : '',
    floor_id : '',
    x : -1,
    y : -1,
    accuracy : -1,
    bearing : ''
  }

  constructor(public platform: Platform, public navCtrl: NavController, public navParams: NavParams) {
    this.buildingId = navParams.get("building_id");
    this.buildingName = navParams.get("building_name");
  }

  ionViewDidEnter() {
  }

  private startPositioning() {
      if (this.positioning == true) {
        console.log("Position listener is already enabled.");
        return;
      }
      let buildings = [{
        'building_id' : this.buildingId,
        'building_name' : this.buildingName
      }];
      //pass building object to start positioning
      this.positioning = true;
      cordova.plugins.Situm.startPositioning(buildings,(res) => {
        setTimeout(() => {
          console.log('Position updated: ' + JSON.stringify(res));
          this.position = res;
        }, 250);
      });
  }

  private stopPositioning() {
    if (this.positioning == false) {
      console.log("Position listener is not enabled.");
      return;
    }
    this.positioning = false;
    cordova.plugins.Situm.stopPositioning((res) => {
    });
  }

  ionViewWillLeave() {
    this.stopPositioning();
  }

}
