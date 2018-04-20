import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, Platform, ToastController } from 'ionic-angular';
import { PositioningPage } from '../positioning/positioning';
import { USER_EMAIL, USER_API_KEY } from '../../services/situm';

declare var cordova: any;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})


export class HomePage {

  public buildings: any[] = [];

  constructor(
    public platform: Platform,
    public navCtrl: NavController,
    public detector: ChangeDetectorRef,
    public toastCtrl: ToastController 
  ) {};

  ionViewDidEnter() {
    this.platform.ready().then(() => {
      cordova.plugins.Situm.setApiKey(USER_EMAIL, USER_API_KEY);
      this.fetchBuildings();
    });
  };

  public fetchBuildings() {
    // Fetchs the buildings for the current user
    // More details in
    // http://developers.situm.es/sdk_documentation/cordova/jsdoc/1.3.10/symbols/Situm.html#.fetchBuildings
    cordova.plugins.Situm.fetchBuildings((res) => {
      this.buildings = res;
      this.detector.detectChanges();
    }, (error) => {
      const errorMsg = 'An error occurred when recovering the buildings.' 
      console.log(`${errorMsg}`, error);
      this.presentToast(`${errorMsg} ${error}`, 'bottom', null);
    });
  };

  showBuilding(building) {
    this.navCtrl.push(PositioningPage, { building: building });
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

}
