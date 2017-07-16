import { Component } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
import {PositioningPage} from '../positioning/positioning';

declare var cordova: any;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})


export class HomePage {

  buildings: any[] = [];

  constructor(public platform: Platform, public navCtrl: NavController) {
    
  };

  ionViewDidLoad() {
    this.platform.ready().then((res) => {
      cordova.plugins.Situm.setApiKey("alberto.doval@cocodin.com", "391b363b6f1a00acf10f67471380980dcdf989ffafc08601229b6c67bb4d1a11");
      this.fetchBuildings();
    });
  };

  ionViewDidEnter() {
    this.fetchBuildings();
  };

  private fetchBuildings() {
    cordova.plugins.Situm.fetchBuildings((res) => {
      setTimeout(() => {
        this.buildings = res;
      }, 250);
    });
  };

  goToPositioning(item) {
    this.navCtrl.push(PositioningPage, item);
  }

}
