# 🏀 BallUp - Basketball Pickup Game Organizer

BallUp is a comprehensive mobile application that helps basketball players find, organize, and join pickup games in their area. Built with React Native and Node.js, it features interactive maps, real-time game management, and a thriving community of basketball enthusiasts.

## 📱 **Core Features**

### 🎯 **Game Discovery & Management**

- **Interactive Map View** - Find nearby games on a visual map with real-time locations
- **List View** - Browse games in a detailed list format with filters
- **Game Creation** - Organize new games with custom settings (skill level, max players, time)
- **Join/Leave Games** - Simple one-tap joining with real-time player count updates
- **Game Status Tracking** - Track games as scheduled, active, completed, or cancelled

### 🗺️ **Advanced Mapping (FREE)**

- **OpenStreetMap Integration** - Completely free mapping with unlimited usage
- **Interactive Markers** - Click game markers to see details and join instantly
- **Location Search** - Find places by name using free Nominatim geocoding
- **Current Location** - Automatic location detection with permission handling
- **Distance Calculations** - See how far games are from your location
- **Smart Performance** - Optimized rendering with marker limits and clustering

### 🏟️ **Court & Location Management**

- **Court Discovery** - Browse and search basketball courts in your area
- **Add New Courts** - Contribute new court locations with map-based selection
- **Court Details** - View amenities, ratings, photos, and user reviews
- **Location Verification** - Community-verified court information
- **Interactive Court Selection** - Tap on map to pinpoint exact court locations

### 👤 **User Profiles & Authentication**

- **Secure Registration** - Create accounts with email verification
- **User Profiles** - Customize profiles with skill levels, preferred positions, and bio
- **Game History** - Track your basketball activity and past games
- **Player Stats** - View your game participation and performance
- **Profile Pictures** - Personalize your profile with custom photos

### 🔍 **Search & Discovery**

- **Dual View Modes** - Toggle between list and map view for game discovery
- **Advanced Filtering** - Filter games by skill level, time, location, and availability
- **Location-Based Search** - Find games within a specific radius of your location
- **Real-Time Updates** - Get live updates on game status and player counts
- **Smart Sorting** - Games sorted by distance, time, and relevance

### 📱 **User Experience**

- **Intuitive Navigation** - Clean, basketball-themed UI with easy navigation
- **Real-Time Notifications** - Get updates about games you've joined
- **Offline Support** - Basic functionality works without internet connection
- **Cross-Platform** - Works on both iOS and Android devices
- **Performance Optimized** - Smooth scrolling, fast loading, optimized for mobile

## 🏗️ **Technical Architecture**

### **Frontend (React Native)**

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── MapView.tsx     # Interactive game discovery map
│   │   └── LocationPickerMap.tsx # Court location selection
│   ├── screens/            # Main application screens
│   │   ├── HomeScreen.tsx          # Dashboard with quick actions
│   │   ├── GameSearchScreen.tsx    # Game discovery (list/map)
│   │   ├── CreateGameScreen.tsx    # Game creation form
│   │   ├── CreateLocationScreen.tsx # Court creation form
│   │   ├── MyGamesScreen.tsx       # User's joined games
│   │   ├── ProfileScreen.tsx       # User profile management
│   │   └── LoginScreen.tsx         # Authentication
│   ├── services/           # API and external service integrations
│   │   ├── api.ts         # Backend API integration
│   │   ├── locationService.ts # Geolocation utilities
│   │   └── geocodingService.ts # Free address lookup
│   ├── hooks/             # Custom React hooks
│   │   └── useMapData.ts  # Map data management
│   ├── config/            # App configuration
│   │   └── maps.ts        # Map settings and providers
│   ├── types/             # TypeScript interfaces
│   └── navigation/        # App navigation structure
```

### **Backend (Node.js/Express)**

```
backend/
├── src/
│   ├── routes/            # API endpoints
│   │   ├── auth.ts       # Authentication routes
│   │   ├── games.ts      # Game management API
│   │   ├── locations.ts  # Court/location API
│   │   └── users.ts      # User management API
│   ├── middleware/        # Express middleware
│   ├── models/           # Database models (Prisma)
│   └── utils/            # Utility functions
├── prisma/               # Database schema and migrations
└── tests/                # API tests
```

## 🛠️ **Technology Stack**

### **Mobile App**

- **React Native 0.73** - Cross-platform mobile development
- **TypeScript** - Type-safe JavaScript development
- **React Navigation 6** - Screen navigation and routing
- **react-native-maps** - Interactive mapping functionality
- **@react-native-community/geolocation** - Location services
- **Axios** - HTTP client for API communication

### **Backend API**

- **Node.js 18+** - Server runtime
- **Express.js** - Web application framework
- **PostgreSQL** - Primary database
- **Prisma** - Database ORM and query builder
- **JWT** - JSON Web Token authentication
- **bcrypt** - Password hashing

### **Mapping & Location**

- **OpenStreetMap** - Free, unlimited mapping service
- **Nominatim API** - Free geocoding and address lookup
- **Device GPS** - Native location services

## 🚀 **Getting Started**

### **Prerequisites**

- Node.js (v18 or higher)
- PostgreSQL database
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development)

### **Installation**

1. **Clone the Repository**

   ```bash
   git clone https://github.com/your-username/ballup.git
   cd BallUp
   ```

2. **Backend Setup**

   ```bash
   cd backend
   npm install

   # Set up environment variables
   cp .env.example .env
   # Edit .env with your database credentials

   # Run database migrations
   npx prisma migrate dev
   npm run dev
   ```

3. **Frontend Setup**

   ```bash
   cd frontend
   npm install

   # Install geolocation dependency for maps
   npm install @react-native-community/geolocation

   # For iOS
   cd ios && pod install && cd ..

   # Start the app
   npm start
   ```

4. **Configure Permissions** (See [GOOGLE_MAPS_SETUP.md](./GOOGLE_MAPS_SETUP.md))
   - Add location permissions to iOS Info.plist
   - Add location permissions to Android manifest

### **Development**

```bash
# Backend (runs on http://localhost:3000)
cd backend && npm run dev


# Frontend (React Native Metro bundler)
cd frontend && npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## 🎮 **How to Use BallUp**

### **For Players**

1. **Sign Up** - Create your account with email and password
2. **Set Up Profile** - Add your skill level, preferred position, and bio
3. **Find Games** - Use the map or list view to discover nearby games
4. **Join Games** - Tap any game marker or card to see details and join
5. **Create Games** - Organize your own games by selecting a court and time
6. **Track Activity** - View your joined games and basketball history

### **For Court Managers**

1. **Add Courts** - Contribute new basketball court locations to the community
2. **Update Information** - Add amenities, photos, and detailed descriptions
3. **Verify Locations** - Help maintain accurate court information

## 🗂️ **API Endpoints**

### **Authentication**

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh JWT token

### **Games**

- `GET /api/games` - List all games
- `GET /api/games/nearby?lat={lat}&lng={lng}&radius={km}` - Find nearby games
- `POST /api/games` - Create new game
- `POST /api/games/{id}/join` - Join a game
- `POST /api/games/{id}/leave` - Leave a game
- `PUT /api/games/{id}` - Update game details
- `DELETE /api/games/{id}` - Cancel game

### **Locations**

- `GET /api/locations` - List all courts
- `POST /api/locations` - Add new court
- `PUT /api/locations/{id}` - Update court information
- `DELETE /api/locations/{id}` - Remove court

### **Users**

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/{id}/games` - Get user's game history

## 🆓 **Free Features**

BallUp is designed to be completely free to use:

- **Unlimited Maps** - OpenStreetMap provides free, unlimited mapping
- **Free Geocoding** - Address lookup via Nominatim API (no API keys required)
- **No Usage Limits** - Create unlimited games, join unlimited courts
- **Open Source** - MIT licensed, contribute and customize freely

## 🔧 **Configuration**

### **Map Providers**

Switch between map providers in `frontend/src/config/maps.ts`:

```typescript
export const MAPS_CONFIG = {
  DEFAULT_PROVIDER: "openstreetmap", // Free option (default)
  // DEFAULT_PROVIDER: 'google',     // Paid option
  // DEFAULT_PROVIDER: 'mapbox',     // Free tier option
};
```

### **Performance Settings**

Adjust performance settings for optimal experience:

```typescript
PERFORMANCE: {
  maxZoomLevel: 18,
  minZoomLevel: 10,
  markerLimit: 50,        // Max markers shown at once
  animationDuration: 300, // Map animation speed
}
```

## 🧪 **Testing**

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test

# Type checking
npm run type-check

# Linting
npm run lint
```

## 📚 **Documentation**

- **[Setup Guide](./GOOGLE_MAPS_SETUP.md)** - Complete setup instructions for maps
- **[Development Setup](./DEVELOPMENT_SETUP.md)** - Development environment setup
- **[Expo Quick Start](./EXPO_QUICK_START.md)** - Quick start with Expo
- **[Play Store Guide](./PLAY_STORE_GUIDE.md)** - Publishing to app stores

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **OpenStreetMap** - Free mapping data and tiles
- **Nominatim** - Free geocoding services
- **React Native Maps** - Excellent mapping library
- **Basketball Community** - For inspiration and feedback

## 📞 **Support**

- 📧 Email: support@ballup.app
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/ballup/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/your-username/ballup/discussions)

---

**Ready to ball? Download BallUp and find your next game! 🏀**
