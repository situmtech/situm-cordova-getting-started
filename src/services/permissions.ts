import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { Diagnostic } from '@ionic-native/diagnostic';

const NOT_DETERMINED = 'not_determined';

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
        }).catch(error => {
          console.log('Error when requesting location authorization for the application', error);
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
      }).catch(error => {
        console.log('Error when requesting location authorization for the application', error);
      });
    }).catch(error => {
      console.log('Error checking if the application is authorized to use location.', error);
    });
  }

  permissionGranted(status) : boolean {
    const grantedValue = this.diagnostic.permissionStatus.GRANTED;
    const grantedWhenInUseValue = this.diagnostic.permissionStatus.GRANTED_WHEN_IN_USE;
    return status == grantedValue || status == grantedWhenInUseValue;
  }

  permissionDenied(status) : boolean {
    const deniedValue = this.diagnostic.permissionStatus.DENIED;
    return status == deniedValue;
  }

  permissionNotRequested(status) : boolean {
    const notRequestedValue = this.diagnostic.permissionStatus.NOT_REQUESTED;
    return status == notRequestedValue || status.toLowerCase() == NOT_DETERMINED;
  }

}


