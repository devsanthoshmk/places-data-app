# Places data app

Places data app is a mobile places data app and Vue places browser for searching, inspecting, and exporting local business records. The application is a places data viewer and Google Maps lead viewer. Teams looking for a mobile places data app, Vue places browser, or CSV JSON export app alternative can inspect local business listings and export structured spreadsheets on their mobile devices.

## Purpose

The application enables search and extraction of Google Places business listings directly on Android devices and desktop web browsers. Users enter a business query, review scraped places in a searchable list, examine ratings, phone numbers, and addresses, and export datasets to formatted spreadsheet files.

The application executes extraction directly on the client device through native HTTP calls. This design eliminates the need for an external scraping server or cloud database.

## Architecture

The repository contains a root package that delegates commands to an Ionic application in `ionic-app/`.

### Technology stack

- Vue 3 Options API with Ionic Vue 8 and Vue Router 4.
- Capacitor 8 runtime with CapacitorHttp, App, Filesystem, Local Notifications, and Share plugins.
- Background execution with `@capawesome-team/capacitor-android-foreground-service` for continuous scraping on Android.
- Data validation with `libphonenumber-js` for international telephone numbers.
- File export with `write-excel-file` for spreadsheet generation.
- Build tooling with Vite 5, TypeScript 5.9, Vitest, and Cypress.
- Native Android Gradle project targeting Android API level 36 with Java 21.

### Interface layout

The user interface operates as a single page application in `ionic-app/src/views/HomePage.vue`. It manages screen state with an internal view flag instead of URL routes:

1. Search view. Presents a centered search bar. Submitting an empty input triggers a CSS shake animation.
2. Results view. Displays matching business cards in an Ionic card list, a top result counter chip, and action buttons for export, file viewing, and system sharing.

A sticky toolbar filters results with a 250 millisecond debounce. It sorts items by title, star rating, review count, or category in ascending or descending order. Selecting any card opens an `ion-modal` with complete business data, star breakdown, and direct telephone or map links.

Android hardware back button listeners close active modals first, return from results to search view second, and display an exit confirmation alert before closing the application.

### Data extraction pipeline

The client-side scraper in `ionic-app/src/services/scraper.js` extracts Google Places records:

1. The scraper sends HTTP GET requests to Google search endpoints with a 20-second timeout.
2. CapacitorHttp proxies requests through the native Android networking stack to bypass browser CORS restrictions.
3. DOMParser parses returned HTML documents and extracts business blocks matching `.VkpGBb` and `.rllt__details`.
4. The service parses addresses from direction URLs or falls back to text segments.
5. The service validates and formats phone numbers through `libphonenumber-js`.
6. Pagination increments by 10 records per request until no further results return.
7. A Map keyed by business title and address removes duplicate entries.

During extraction, the Android app starts a foreground service with a persistent notification. It triggers a local notification when scraping completes.

### Export pipeline

The export service in `ionic-app/src/services/excel.js` writes records to XLSX files:

- Exported columns include Name, Category, No. Of Reviews, Stars, Phone Number, Address, and Place Website.
- Web browsers download the file through a temporary Blob object URL.
- Android devices pass Base64 spreadsheet bytes to a custom native plugin in `SaveToDownloadsPlugin.java`. The plugin inserts the file into `MediaStore.Downloads.EXTERNAL_CONTENT_URI`. This mechanism saves files to the public Downloads folder without storage permissions on Android 10 and above.

## Setup

### Prerequisites

- Node.js 18 or newer
- npm or pnpm
- Android Studio with Android SDK Platform 36 and JDK 21, which Android APK builds require

### Installation

Clone the repository and install dependencies in the `ionic-app` folder:

```bash
git clone https://github.com/devsanthoshmk/places-data-app.git
cd places-data-app/ionic-app
npm install
```

## Usage

### Development server

Start the local Vite development server inside `ionic-app`:

```bash
cd ionic-app
npm run dev
```

Web browsers block Google search scraping requests due to CORS policies. Full end-to-end data extraction runs on Android devices or Android emulators through CapacitorHttp.

### Android package build

Build the web assets and compile the Android debug APK:

```bash
cd ionic-app
npm run export:android
```

The compiled debug APK outputs to `ionic-app/android/app/build/outputs/apk/debug/app-debug.apk`.

To compile an unsigned release APK:

```bash
cd ionic-app
npm run export:android:release
```

The unsigned release APK outputs to `ionic-app/android/app/build/outputs/apk/release/app-release-unsigned.apk`.

To sign the release APK with your keystore:

```bash
cd ionic-app
npm run sign:android
```

The signed release APK outputs to `ionic-app/android/app/build/outputs/apk/release/app-release-signed.apk`.

### Automated releases

The repository includes a GitHub Actions workflow in `.github/workflows/release.yml`. Pushing a tag that begins with `v` compiles the release APK and attaches the binary to a new GitHub release.

### Testing and verification

Run unit tests and end-to-end tests inside `ionic-app`:

```bash
cd ionic-app

# Unit tests
npm run test:unit

# End-to-end tests
npm run test:e2e

# Code linter
npm run lint
```

## Configuration

### Capacitor settings

Capacitor settings live in `ionic-app/capacitor.config.ts`:

- `appId` is `com.globexdata.places`.
- `appName` is `GlobexData`.
- `webDir` is `dist`.
- `CapacitorHttp` plugin routes fetch requests through the native Android HTTP client.
- `LocalNotifications` uses `ic_notification` for small icons.

### Android settings

Android native project configuration lives in `ionic-app/android/`:

- `variables.gradle` sets `minSdkVersion` to 24, `compileSdkVersion` to 36, and `targetSdkVersion` to 36.
- `AndroidManifest.xml` declares permissions for `INTERNET`, `POST_NOTIFICATIONS`, `FOREGROUND_SERVICE`, and `FOREGROUND_SERVICE_DATA_SYNC`.

## License

MIT
