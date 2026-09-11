# Heritage Plus: easiest setup

## What you need

Install **Node.js 20 or newer** and obtain one **PostgreSQL database with PostGIS enabled**. You do not need to install PostGIS locally if you use a managed PostgreSQL provider that supports it.

## One-command setup

From the extracted project directory:

```bash
chmod +x setup.sh
./setup.sh
```

The script:

1. Creates `.env` and `server/.env` from the examples.
2. Generates a session secret if one is empty.
3. Installs frontend and backend dependencies.
4. Runs database migration and seed commands when `DATABASE_URL` is configured.
5. Prints the commands needed to start the app.

## Configure the database

Open `server/.env` and set:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/heritage_plus?sslmode=require
SESSION_SECRET=your-long-random-secret
```

The database must support PostGIS. If the database is not configured yet, run `./setup.sh` anyway; it installs the project and tells you what remains.

## Start the application

Terminal 1:

```bash
cd server
npm run dev
```

Terminal 2, from the project root:

```bash
npm run dev
```

Open the frontend URL printed by Vite, usually `http://localhost:5173`.

## Create reviewer accounts

After the database is configured:

```bash
cd server
npm run migrate
npm run seed
npm run seed:users
```

Use generated credentials only for local development. Change passwords before any deployment.

## Check the backend

```bash
curl http://localhost:3000/health
curl -i http://localhost:3000/ready
```

`/health` confirms the process is running. `/ready` returns success only when required dependencies are available.

## Deployment variables

For deployment, copy `server/.env.example` into the platform's environment settings. Configure S3-compatible storage with `STORAGE_PROVIDER=s3`, `STORAGE_ENDPOINT`, and `STORAGE_BUCKET`; the application refuses to silently store files on local disk when S3 mode is selected.

Worker and EO processing are opt-in through `WORKER_ENABLED` and `EO_PROCESSING_ENABLED`. Do not enable them until a persistent worker with the required raster tooling and storage access is deployed.

## If you only want to inspect the UI

You can run the frontend without PostgreSQL:

```bash
npm ci
npm run dev
```

Some API-backed pages and all live integration tests require the backend and database.

## Android app build

The Android app is a Capacitor wrapper around the web build. Supabase service-role credentials must never be included in the Android app; they belong only on the backend.

First deploy the backend and obtain its HTTPS API URL. Then create a root `.env.production` file containing only the public API URL:

```env
VITE_API_URL=https://YOUR_API_DOMAIN/api
```

Install Android Studio, Android SDK, SDK Platform 35 or the version required by `android/variables.gradle`, Android build tools, and a JDK 21. From the project root run:

```bash
npm ci
npm run build
npx cap sync android
npx cap open android
```

In Android Studio, select the `app` configuration and run it on an emulator or a physical Android device. For a debug APK from the command line:

```bash
cd android
./gradlew assembleDebug
```

The APK is written to `android/app/build/outputs/apk/debug/app-debug.apk`. The manifest already requests internet and fine/coarse location permissions; Android still requires the user to grant location permission at runtime, and the app must show unavailable GPS state when permission is denied.

For a release build, configure a signing key in the deployment environment, never commit it, and build an Android App Bundle:

```bash
cd android
./gradlew bundleRelease
```

Upload `android/app/build/outputs/bundle/release/app-release.aab` to Google Play Console for internal testing before wider release. Test field capture, permission denial, offline/network errors, camera/evidence upload, map rendering, authentication, and review workflows on a real device.
