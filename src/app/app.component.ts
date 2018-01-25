import { Component, ViewChild } from '@angular/core';
import { Platform, Nav } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../pages/home/home';


declare var cordova: any;
@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;
  constructor(platform: Platform, splashScreen: SplashScreen) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      cordova.plugins.Situm.setApiKey("oscar.fuentes@cocodin.com", "98a83630ce6667627f0e231cbde0f5052512290c9d52e7965f53486587cf7b22");
      splashScreen.hide();
      this.nav.setRoot(HomePage);
    });
  }
}

