# Building the Heritage Plus APK

This project is a React/Vite web app wrapped as a native Android app using
[Capacitor](https://capacitorjs.com/). The `android/` folder is a complete,
ready-to-build Android Studio (Gradle) project — nothing else needs to be
scaffolded.

I could not compile the final `.apk` from inside this chat: doing so requires
the Android SDK and Google's Maven/Gradle distribution servers, and this
sandbox's network is locked to package registries (npm/PyPI/GitHub) only, with
no Android SDK installed. Both options below take about 5–10 minutes and
produce a real, installable APK.

## Option A — Android Studio (easiest, no GitHub needed)

1. Install [Android Studio](https://developer.android.com/studio) (this
   project needs a recent version — it targets SDK 36 / AGP 8.13).
2. Unzip this project, then in Android Studio choose **Open** and select the
   `android/` folder.
3. Let it finish "Gradle Sync" (first run downloads the SDK platform/build
   tools automatically — needs internet).
4. **Build → Build App Bundle(s) / APK(s) → Build APK(s)**.
5. Grab the APK from `android/app/build/outputs/apk/debug/app-debug.apk`, or
   click "locate" in the notification that appears when the build finishes.
6. To install on a phone: enable "Install unknown apps" for your file manager,
   copy the APK over, and tap it. Or with a phone plugged in via USB debugging:
   `adb install app-debug.apk`.

If you change the web app source later, run `npm run build && npx cap sync
android` before rebuilding in Android Studio, so the native shell picks up
the latest web bundle.

## Option B — GitHub Actions (no local Android Studio needed)

A workflow is already included at `.github/workflows/android-build.yml`.
Push this project to a GitHub repo (or add it to an existing one) and it will:

1. Install Node deps and build the web app.
2. Sync the Capacitor Android project.
3. Run `./gradlew assembleDebug` on GitHub's runners (which have full internet
   access to the Android SDK/Gradle, unlike this sandbox).
4. Upload the resulting `app-debug.apk` as a downloadable build artifact
   (Actions tab → the workflow run → Artifacts).

You can also trigger it manually from the **Actions** tab
("Build Android APK" → **Run workflow**) without pushing new code.

## Notes on this build

- Built from the `main` branch snapshot (the most recently updated and most
  complete of the branches you uploaded — 200 files, all the other branches'
  work already appears merged into it).
- Fixed two TypeScript type errors in the internal `TeamStatusPage` dashboard
  (it referenced JSON fields that no longer exist in
  `project/GATE_STATUS.json` / `project/TEAM_MEMBERS.json`) — these were
  blocking the production build (`npm run build`).
- Added `ACCESS_FINE_LOCATION` / `ACCESS_COARSE_LOCATION` to
  `AndroidManifest.xml` so the field-capture GPS flow (`navigator.geolocation`)
  can prompt for and get location permission on-device.
- App ID: `org.heritageplus.app`, display name "Heritage Plus" — edit these in
  `capacitor.config.ts` before a real release if you want something else.
- This produces a **debug** APK, fine for sideloading/testing. For a Play
  Store release you'd also need to generate a signing keystore and build a
  signed release bundle — ask if you want help with that step.
