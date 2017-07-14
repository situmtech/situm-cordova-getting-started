import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

declare var cordova: any;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})


export class HomePage {

  building: any = undefined;

  constructor(public navCtrl: NavController) {
    
  }

  fetchBuildings() {
    let buildings: any = cordova.plugins.Situm.fetchBuildings(res => {
      this.building = res;
    });
    console.log(JSON.stringify(buildings));
  };

}
