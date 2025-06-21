# Fitness App

A modern fitness tracking application with Firebase authentication, featuring a beautiful UI with dark mode support.

## Features

### 🔐 Authentication
- **Email/Password Login & Signup**
- **Google OAuth Integration**
- **Forgot Password Flow** with email reset
- **User Profile Management**
- **Secure Logout**

### 🎨 User Interface
- **Modern Glassmorphism Design**
- **Dark Mode Support** (no flash on load)
- **Responsive Layout**
- **Smooth Animations**
- **Beautiful Gradient Backgrounds**

### 📱 Dashboard
- **Welcome Screen** with user info
- **Quick Action Cards**
- **Settings Panel**
- **User Profile View**

## Setup Instructions

### 1. Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable "Email/Password"
   - Enable "Google" provider
4. Get your Firebase config:
   - Go to Project Settings > General
   - Scroll down to "Your apps"
   - Click the web icon (</>)
   - Register your app and copy the config

### 2. Update Firebase Config

Replace the placeholder values in `src/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Project Structure

```
src/
├── components/
│   ├── Login.tsx          # Login component with email/password & Google auth
│   ├── Login.css          # Authentication styles
│   ├── Signup.tsx         # Signup component
│   ├── Dashboard.tsx      # Main dashboard after login
│   ├── Dashboard.css      # Dashboard styles
│   ├── Settings.tsx       # Settings & user profile
│   └── Settings.css       # Settings styles
├── contexts/
│   └── AuthContext.tsx    # Firebase authentication context
├── firebase.ts            # Firebase configuration
├── App.tsx               # Main app component with auth flow
└── index.css             # Global styles with dark mode
```

## Authentication Flow

1. **Initial Load**: Shows login screen by default
2. **Login Options**: 
   - Email/password login
   - Google OAuth login
   - "Forgot Password" link
   - "Sign Up" link
3. **Signup**: 
   - Email/password registration
   - Google OAuth signup
   - Password confirmation validation
4. **Dashboard**: 
   - Welcome screen with user info
   - Quick action cards
   - Settings access
5. **Settings**: 
   - User profile view
   - Account information
   - Logout functionality

## Dark Mode

The app automatically detects and applies the user's system preference for dark/light mode. The dark mode flash issue has been resolved by:

1. Adding a script in `index.html` that sets the color scheme immediately
2. Using CSS classes instead of media queries for better control
3. Applying styles before the React app loads

## Technologies Used

- **React 19** with TypeScript
- **Firebase Authentication**
- **Vite** for build tooling
- **CSS3** with modern features (backdrop-filter, gradients)
- **Responsive Design**

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Adding New Features

1. Create new components in `src/components/`
2. Add corresponding CSS files
3. Update the dashboard or create new routes
4. Test authentication flow

## Security Notes

- Firebase handles all authentication securely
- User data is stored in Firebase Auth
- No sensitive data is stored locally
- HTTPS is required for production deployment

## Deployment

1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting service
3. Ensure your Firebase project allows your domain
4. Update Firebase Auth settings for production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test the authentication flow
5. Submit a pull request

## License

MIT License - feel free to use this project for your own fitness app!
