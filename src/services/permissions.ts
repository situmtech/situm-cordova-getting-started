import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { Diagnostic } from '@ionic-native/diagnostic';


@Injectable()
export class PermissionsService {

  constructor(
    private platform: Platform,
    private diagnostic: Diagnostic
  ) {}

  isAndroid() {
    return this.platform.is('android');
  }

  isiOS() {
    return this.platform.is('ios');
  }

  checkLocationPermissions() : Promise<boolean> {
    return new Promise(resolve => {
      if (this.isiOS()) {
        return this.checkiOSLocationPermissions(resolve);
      }
      if (this.isAndroid()) {
        return this.checkAndroidLocationPermissions(resolve);
      }
    });
  }

  checkiOSLocationPermissions(resolve) {
    this.diagnostic.getLocationAuthorizationStatus().then(status => {
      if (this.permissionGranted(status)) resolve(true);
      if (this.permissionDenied(status)) resolve(false);
      if (this.permissionNotRequested(status)) {
        this.diagnostic.requestLocationAuthorization().then(authorization => {
          resolve(this.permissionGranted(authorization));
        });
      }
    });
  }

  checkAndroidLocationPermissions(resolve) {
    this.diagnostic.isLocationAuthorized().then(authorized => {
      if (authorized) {
        resolve(true);
        return;
      }
      this.diagnostic.requestLocationAuthorization().then(authorization =>{
        resolve(this.permissionGranted(authorization));
      });
    });
  }

  permissionGranted(status) : boolean {
    const grantedValue = this.diagnostic.permissionStatus.GRANTED;
    console.log('Granted value', grantedValue);
    console.log('Device status', status);
    return status == grantedValue;
  }

  permissionDenied(status) : boolean {
    const deniedValue = this.diagnostic.permissionStatus.DENIED;
    console.log('Denied value', deniedValue);
    console.log('Device status', status);
    return status == deniedValue;
  }

  permissionNotRequested(status) : boolean {
    const notRequestedValue = this.diagnostic.permissionStatus.NOT_REQUESTED;
    console.log('Not requested value', notRequestedValue);
    console.log('Device status', status);
    return status == notRequestedValue || status.toLowerCase() == 'not_determined';
  }

}


