# RutgersBallUp Frontend

A fully functional frontend for the RutgersBallUp basketball pickup game platform.

## Features

This frontend provides complete functionality including:

- **User Authentication**: Registration and login with JWT tokens
- **Dashboard**: View stats and quick access to main features
- **Find Games**: Search and filter basketball games with list and map views
- **Create Games**: Create new pickup games with location selection
- **Join/Leave Games**: Full game participation management
- **Add Courts**: Add new basketball courts with interactive map selection
- **My Games**: Manage created and joined games
- **Profile Management**: Update user profile and view stats
- **Real-time Integration**: Connected to backend API with proper error handling

## Setup

### Prerequisites

1. Make sure the backend server is running on `http://localhost:3000`
2. The backend should be properly configured with database and environment variables

### Running the Frontend

#### Option 1: Using Python HTTP Server
```bash
cd frontend
python3 -m http.server 8080
```
Then open `http://localhost:8080` in your browser.

#### Option 2: Using Node.js HTTP Server
```bash
cd frontend
npx http-server -p 8080
```

#### Option 3: Using any other local web server
Just serve the `frontend` directory on any port (e.g., 8080) and access it via your browser.

## Usage

### Getting Started

1. **Landing Page**: The app starts with a beautiful landing page showcasing features
2. **Launch App**: Click "Launch App" or "Experience RutgersBallUp" to enter the application
3. **Authentication**: 
   - If not logged in, you'll see the login screen
   - Create a new account or login with existing credentials
   - The app supports full registration with first name, last name, username, email, and password

### Main Features

#### Dashboard
- View personalized stats and quick actions
- See available games, active courts, and your game history
- Quick navigation to all main features

#### Find Games
- **List View**: Browse all available games with filtering options
- **Map View**: See games plotted on an interactive map
- **Search**: Search games by title, description, or location
- **Filters**: Filter by skill level and game status
- **Join Games**: Join available games with real-time participant tracking

#### Create Games
- Select from available courts
- Set game details (title, date/time, max players, skill level, type)
- Add game description
- Automatic creator participation

#### Add Courts
- Interactive map for precise location selection
- Address search and reverse geocoding
- Court type and surface selection
- Amenity selection with visual chips
- Full court information management

#### My Games
- View games you've created vs. games you've joined  
- Manage your game participation
- Cancel created games or leave joined games

#### Profile
- Update personal information and basketball preferences
- View your game statistics and ratings
- Manage skill level and preferred position

### API Integration

The frontend is fully integrated with the backend API:

- **Authentication**: JWT token-based authentication with automatic token management
- **Real-time Data**: All data is loaded from the backend database
- **Error Handling**: Comprehensive error messages and user feedback
- **Rate Limiting**: Respects backend rate limiting with proper user feedback
- **Security**: Secure API communication with proper headers and validation

### Key Technical Features

- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Interactive Maps**: Uses Leaflet and OpenStreetMap for location features
- **Modern UI**: Glass morphism design with smooth animations
- **Real-time Updates**: Live data from backend with proper loading states
- **Progressive Enhancement**: Degrades gracefully if backend is unavailable
- **Accessibility**: Proper form labels, semantic HTML, and keyboard navigation

## API Endpoints Used

The frontend integrates with these backend endpoints:

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration  
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update user profile
- `GET /api/users/me/games` - Get user's games
- `GET /api/games` - Get all games with filters
- `POST /api/games` - Create new game
- `POST /api/games/:id/join` - Join a game
- `POST /api/games/:id/leave` - Leave a game
- `DELETE /api/games/:id` - Cancel/delete a game
- `GET /api/locations` - Get all locations
- `POST /api/locations` - Add new location

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Development

The frontend is built with vanilla JavaScript and modern web standards:

- **No Framework Dependencies**: Pure JavaScript for maximum compatibility
- **CSS Grid/Flexbox**: Modern responsive layouts
- **ES6+ Features**: Modern JavaScript features with graceful degradation
- **Progressive Web App Ready**: Can be enhanced with service workers

## Troubleshooting

### Common Issues

1. **"Network error" messages**: Ensure the backend server is running on `http://localhost:3000`
2. **CORS errors**: The backend should have CORS configured for `http://localhost:8080`
3. **Authentication issues**: Clear localStorage and try logging in again
4. **Map not loading**: Check internet connection for OpenStreetMap tiles

### Debug Mode

Open browser developer tools and check the console for detailed error messages. The app provides comprehensive logging for debugging.

## Production Deployment

For production deployment:

1. Update the `apiBaseUrl` in `js/app.js` to point to your production backend
2. Configure proper CORS settings in the backend
3. Use a proper web server (nginx, Apache) instead of the development servers
4. Enable HTTPS for secure authentication
5. Consider implementing service workers for offline functionality

## Contributing

The codebase is well-structured and commented for easy contribution:

- `index.html` - Main HTML structure
- `js/app.js` - Main application logic and API integration
- `styles/main.css` - All styling and responsive design

Follow the existing code patterns and ensure all new features integrate properly with the backend API.