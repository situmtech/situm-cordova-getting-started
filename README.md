# Situm Cordova Getting Started

NOTE: This app is only a use-case for testing purposes. It may not be up to date or optimized.

* [Usage](#usage)
* [Run Android version](#run-android-version)
* [Run iOS version](#run-ios-version)

## Usage

1) Ionic installation : https://ionicframework.com/docs/intro/installation/

2) Initialize project:

```
npm install
```

3) Link development plugin folder: 

```
  $ cd situm-cordova-getting-started
  $ cordova plugin add --link <path_to_plugin_folder>/situm-cordova-plugin/
```

So, `config.xml` file should contain one line like this:

    <plugin name="situm-cordova-plugin" spec="file:../situm-cordova-plugin" />


## Run Android version

- **Run from command line**: `$ ionic cordova run android`

- **Run from Android Studio**: Go to plaftforms/android folder. Create android studio project and run `MainActivity` class


## Run iOS version

- **Run from command line**: `$ ionic cordova run ios`

- **Run from Xcode**: Go to platforms/ios folder and open `Situm Cordova Getting Started.xcworkspace`
