# Situm Cordova Getting Started

NOTE: This app is only a use-case for testing purposes. It may not be up to date or optimized.

* [Usage](#usage)
* [Run Android version](#run-android-version)
* [Run iOS version](#run-ios-version)
* [Support information](#supportinfo)

## Usage

1) Ionic installation : https://ionicframework.com/docs/intro/installation/

2) Initialize project:

```
npm install
```

3) Add desired platforms:

```
$ cordova platform add android //if you want to generate an Android app
$ cordova platform add iOS //if you wat yo generate an iOS app
```

4) Link development plugin folder (optional): 

In case you have a local copy of Situm Cordova Plugin, you may want to add it to the project, in order to be able to modify or debug it. If this is the case, you should remove the current plugin version from npm and add the local one. Provided that the plugin is located at the parent folder, this can be done as follows:

```
  $ ionic cordova plugin remove situm-cordova-plugin-official
  $ cordova plugin add --link <path_to_plugin_folder>/situm-cordova-plugin-official/
```

Before launching the application it is necessary to cover the credentials in the `src/services/situm.ts` file.

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
