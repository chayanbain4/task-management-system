# TaskFlow — Flutter App

Modern Flutter mobile app for the Task Management backend.

## Tech Stack

- Flutter (Dart)
- Riverpod (state management)
- Dio (HTTP client with interceptors)
- flutter_secure_storage (token storage)
- Material 3 UI

---

## Features

- Login & Register screens with animated gradient UI
- JWT access token handling (auto-attached to every request)
- Automatic token refresh on 401 (retries original request)
- Refresh token stored securely via `flutter_secure_storage`
- Task list with:
  - Pagination + infinite scroll
  - Search by title (debounced)
  - Filter by status (All / Pending / Completed)
  - Pull to refresh
  - Add / Edit / Delete / Toggle status
- Snackbar error handling (401, 500, network errors)
- Riverpod layered architecture (UI → Controller → Repository → API)

---

## Prerequisites

- Flutter SDK installed ([flutter.dev](https://flutter.dev))
- Android Studio or VS Code with Flutter extension
- Android Emulator **or** physical Android device
- Backend running locally on port `4000`

---

## Run Steps

### 1. Start the backend first

Make sure your Node.js backend is running:

```bash
cd backend
npm install
npm run dev
```

Backend should be running at `http://localhost:4000`

### 2. Open Flutter project

```bash
cd Flutter-frontend
```

Open this folder in Android Studio or VS Code.

### 3. Install packages

```bash
flutter pub get
```

### 4. Run on Android Emulator

```bash
flutter run
```

> The app uses `http://10.0.2.2:4000` by default — this is the Android emulator's alias for your computer's localhost.

---

## Running on Physical Android Device

Connect your phone via USB and make sure your phone and computer are on the **same Wi-Fi network**, then:

```bash
flutter run --dart-define=API_BASE_URL=http://YOUR_COMPUTER_IP:4000
```

Find your computer IP:
- Mac: `ifconfig | grep "inet "` → look for `192.168.x.x`
- Windows: `ipconfig` → look for IPv4 Address

Example:

```bash
flutter run --dart-define=API_BASE_URL=http://192.168.1.5:4000
```

---

## Running on iOS Simulator

```bash
flutter run --dart-define=API_BASE_URL=http://localhost:4000
```

> iOS simulator uses `localhost` directly (not `10.0.2.2`).

---

## Custom Backend URL

If your backend runs on a different port or machine:

```bash
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:YOUR_PORT
```

---

## Project Structure

```
lib/
  app/                          # App entry, routing
  core/
    config/                     # App config (base URL)
    errors/                     # ApiException class
    network/                    # Dio ApiClient + interceptors
    storage/                    # SecureStorageService
    theme/                      # App theme, colors
    utils/                      # Snackbar utils
    widgets/                    # Shared widgets (buttons, cards)
  features/
    auth/
      data/                     # AuthRepository
      models/                   # UserModel
      presentation/
        controllers/            # AuthController (Riverpod)
        screens/                # AuthScreen, SplashScreen
    tasks/
      data/                     # TaskRepository
      models/                   # TaskModel, TaskStatus, Pagination
      presentation/
        controllers/            # TasksController (Riverpod)
        screens/                # TasksScreen, TaskFormScreen
        widgets/                # TaskCard, TaskStatusBadge
```

---

## Notes

- Backend sends refresh token via `Set-Cookie` header — the app captures and stores it securely for mobile use.
- Access token is auto-refreshed on `401` responses and the original request is retried automatically.
- Android cleartext HTTP (`android:usesCleartextTraffic="true"`) is enabled for local development.
- For production, switch to HTTPS and disable cleartext traffic.
