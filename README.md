# Situm Cordova Getting Started

NOTE: This app is only a use-case for testing purposes.

## Table of contents
* [Usage](#usage)
* [Run Android version](#run-android-version)
* [Run iOS version](#run-ios-version)
* [Support information](#supportinfo)

## Usage

### 1. Previous requirements 

#### Common
* [NodeJS](https://nodejs.org/en/)
* [Ionic framework](https://ionicframework.com/docs/intro/installation/)
* Git

#### Android
* Java JDK 
* [Android Studio](https://developer.android.com/studio/) (recommended) or at least [Gradle](https://gradle.org/install/)
* Android SDK 26
* Android build tools 26.0.2

#### iOS
* A computer running macOS
* Xcode
* [Cocoapods](https://cocoapods.org) 


### 2. Initialize project:

```
npm install
```

Create `www` folder if not exists: 

```
mkdir www
```

### 4. iOS only. Install ios-deploy
```
npm install ios-deploy
```

### 4. Add desired platforms:

```
$ cordova platform add android //if you want to generate an Android app (android platform above 7.0.0)
$ cordova platform add ios //if you wat yo generate an iOS app
```

### 5. Add credentials
Before launching the application it is necessary to provide SITUM credentials in the `src/services/situm.ts` file.
Besides Google Maps Api Keys should be included in `config.xml`, in the `preferences` named `GOOGLE_MAPS_IOS_API_KEY` and `GOOGLE_MAPS_ANDROID_API_KEY`. In this example app, these Google Maps Api Keys are already included for you.

### 6. Install necessary dependencies
```
npm install @ionic/app-scripts@latest --save-dev
```

### 7. Link development plugin folder (optional): 

In case you have a local copy of Situm Cordova Plugin, you may want to add it to the project, in order to be able to modify or debug it. If this is the case, you should remove the current plugin version from npm and add the local one. Provided that the plugin is located at the parent folder, this can be done as follows:

```
  $ ionic cordova plugin remove situm-cordova-plugin-official
  $ cordova plugin add --link <path_to_plugin_folder>/situm-cordova-plugin-official/
```

So, `config.xml` file should contain one line like this:


    <plugin name="situm-cordova-plugin" spec="file:../situm-cordova-plugin" />
    

## Run Android version

- **Run from command line**: `$ ionic cordova run android`

- **Run from Android Studio**: Go to plaftforms/android folder. Create android studio project and run `MainActivity` class


## Run iOS version

- **Run from command line**: `$ ionic cordova run ios`

- **Run from Xcode**: Go to platforms/ios folder and open `Situm Cordova Getting Started.xcworkspace`

## <a name="supportinfo"></a> Support information

For any question or bug report, please send an email to [support@situm.es](mailto:support@situm.es)
