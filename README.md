# Places Data App

A cross-platform mobile and desktop application for browsing, filtering, validating, and exporting harvested Google Maps and local places datasets. Built with Vue 3, Ionic 8, and Capacitor.

---

## Features

- **Dataset Exploration:** Rapidly search, sort, and inspect localized business listings and metadata.
- **Phone Number Validation:** Integrated validation and formatting for international phone numbers via `libphonenumber-js`.
- **Excel & Spreadsheet Export:** One-click export to formatted Excel files (`.xlsx`) using `write-excel-file`.
- **Background Sync:** Continuous processing on Android devices using Capacitor foreground services.
- **Local Storage:** Persistent offline dataset access using Capacitor Filesystem.
- **Multi-Platform Deployment:** Runs on Web, Android APK, and iOS builds.

---

## Tech Stack

- **Frontend:** Vue 3 (Composition API), Ionic Vue 8, Vue Router 4, Tailwind CSS
- **Mobile Runtime:** Capacitor 8 (Android & iOS bridges)
- **Tooling:** Vite 5, TypeScript, ESLint, Vitest, Cypress

---

## Project Structure

```
places-data-app/
├── ionic-app/
│   ├── src/
│   │   ├── views/          # Screen views and dataset dashboards
│   │   ├── components/     # UI components and data tables
│   │   ├── router/         # Ionic navigation router
│   │   └── App.vue         # Root application component
│   ├── android/            # Native Android Gradle workspace
│   ├── vite.config.ts      # Vite build configuration
│   └── package.json        # Dependencies and build scripts
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm or npm
- Android Studio & JDK 17 (for Android mobile builds)

### Installation

```bash
cd ionic-app
npm install
```

### Development Server

```bash
npm run dev
```

### Building for Web

```bash
npm run build
```

### Building Android APK

```bash
# Sync web build to Android project
npm run build:android

# Generate debug APK
npm run export:android
# Output: android/app/build/outputs/apk/debug/app-debug.apk

# Generate and sign release APK
npm run export:android:release
```

---

## License

MIT
