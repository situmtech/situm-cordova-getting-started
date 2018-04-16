import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
import { PositioningPage } from '../positioning/positioning';

declare var cordova: any;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})


export class HomePage {

  public buildings: any[] = [];

  constructor(public platform: Platform, public navCtrl: NavController, public detector: ChangeDetectorRef) { };

  ionViewDidEnter() {
    this.platform.ready().then(() => {
      cordova.plugins.Situm.setApiKey("USER_EMAIL", "USER_API_KEY");
      this.fetchBuildings();
    });
  };

  public fetchBuildings() {
    cordova.plugins.Situm.fetchBuildings((res) => {
      this.buildings = res;
      this.detector.detectChanges();
    });
  };

  goToPositioning(item) {
    this.navCtrl.push(PositioningPage, { building: item });
  }

}
