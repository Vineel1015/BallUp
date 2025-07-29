// RutgersBallUp Web App - Complete Functionality
class BallUpApp {
    constructor() {
        this.currentView = 'dashboard';
        this.gamesData = [];
        this.locationsData = [];
        this.userLocation = null;
        this.selectedLocation = null;
        this.gamesMap = null;
        this.locationPickerMap = null;
        this.currentUser = null;
        this.isAuthenticated = false;
        
        this.initializeData();
        this.bindEvents();
        this.checkAuth();
    }
    
    initializeData() {
        // Mock games data
        this.gamesData = [
            {
                id: '1',
                title: 'Downtown Basketball Tournament',
                description: 'Competitive tournament with prizes. All skill levels welcome!',
                dateTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
                maxPlayers: 16,
                currentPlayers: 12,
                skillLevel: 'intermediate',
                status: 'scheduled',
                location: {
                    id: '1',
                    name: 'Downtown Sports Complex',
                    address: '123 Sports Ave, Downtown',
                    latitude: 40.7831,
                    longitude: -73.9712,
                    amenities: ['indoor', 'parking', 'restrooms', 'lighting']
                }
            },
            {
                id: '2',
                title: 'Morning Pickup Game',
                description: 'Early morning game for the dedicated players.',
                dateTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
                maxPlayers: 10,
                currentPlayers: 7,
                skillLevel: 'advanced',
                status: 'scheduled',
                location: {
                    id: '2',
                    name: 'Central Park Courts',
                    address: 'Central Park, NYC',
                    latitude: 40.7589,
                    longitude: -73.9851,
                    amenities: ['outdoor', 'free', 'multiple courts']
                }
            },
            {
                id: '3',
                title: 'Beginner Friendly Session',
                description: 'Perfect for newcomers to learn and have fun!',
                dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                maxPlayers: 12,
                currentPlayers: 8,
                skillLevel: 'beginner',
                status: 'scheduled',
                location: {
                    id: '3',
                    name: 'Community Center Court',
                    address: '456 Community St',
                    latitude: 40.7951,
                    longitude: -73.9712,
                    amenities: ['indoor', 'air conditioning', 'water fountain']
                }
            }
        ];

        this.locationsData = this.gamesData.map(game => game.location);
    }
    
    bindEvents() {
        // Navigation events
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-nav]')) {
                e.preventDefault();
                this.navigateTo(e.target.dataset.nav);
            }
        });
    }
    
    navigateTo(section) {
        // Check if user needs authentication for protected sections
        const protectedSections = ['dashboard', 'games', 'create', 'profile', 'locations', 'mygames'];
        if (protectedSections.includes(section) && !this.isAuthenticated) {
            this.showAuthSection('login');
            return;
        }
        
        this.currentView = section;
        this.loadAppSection(section);
        
        // Update active nav
        document.querySelectorAll('[data-nav]').forEach(nav => {
            nav.classList.toggle('active', nav.dataset.nav === section);
        });
    }
    
    loadAppSection(section) {
        const content = document.getElementById('app-content');
        
        switch(section) {
            case 'dashboard':
                this.renderDashboard(content);
                break;
            case 'games':
                this.renderGamesSection(content);
                break;
            case 'create':
                this.renderCreateGameSection(content);
                break;
            case 'profile':
                this.renderProfileSection(content);
                break;
            case 'locations':
                this.renderLocationsSection(content);
                break;
            case 'mygames':
                this.renderMyGamesSection(content);
                break;
            default:
                this.renderDashboard(content);
        }
    }
    
    renderDashboard(container) {
        container.innerHTML = `
            <div class="dashboard-container">
                <div class="dashboard-header">
                    <h1 class="dashboard-title">Welcome to RutgersBallUp</h1>
                    <p class="dashboard-subtitle">Your personalized basketball dashboard</p>
                </div>
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">🏀</div>
                        <div class="stat-number">${this.gamesData.length}</div>
                        <div class="stat-label">Available Games</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">📍</div>
                        <div class="stat-number">${this.locationsData.length}</div>
                        <div class="stat-label">Active Courts</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">👥</div>
                        <div class="stat-number">${this.gamesData.reduce((sum, game) => sum + game.currentPlayers, 0)}</div>
                        <div class="stat-label">Active Players</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">⭐</div>
                        <div class="stat-number">4.8</div>
                        <div class="stat-label">Avg Rating</div>
                    </div>
                </div>
                
                <div class="dashboard-actions">
                    <div class="action-grid">
                        <div class="dashboard-card" data-nav="games">
                            <div class="card-icon">🔍</div>
                            <h3 class="card-title">Find Games</h3>
                            <p class="card-description">Discover pickup games happening near you</p>
                            <div class="card-arrow">→</div>
                        </div>
                        
                        <div class="dashboard-card" data-nav="create">
                            <div class="card-icon">➕</div>
                            <h3 class="card-title">Create Game</h3>
                            <p class="card-description">Organize your own basketball game</p>
                            <div class="card-arrow">→</div>
                        </div>
                        
                        <div class="dashboard-card" data-nav="locations">
                            <div class="card-icon">📍</div>
                            <h3 class="card-title">Add Court</h3>
                            <p class="card-description">Help others discover great courts</p>
                            <div class="card-arrow">→</div>
                        </div>
                        
                        <div class="dashboard-card" data-nav="profile">
                            <div class="card-icon">👤</div>
                            <h3 class="card-title">Your Profile</h3>
                            <p class="card-description">Manage your basketball profile</p>
                            <div class="card-arrow">→</div>
                        </div>
                    </div>
                </div>
                
                <div class="recent-games">
                    <h2 class="section-title">Recent Games</h2>
                    <div class="games-grid">
                        ${this.gamesData.slice(0, 3).map(game => this.renderGameCard(game)).join('')}
                    </div>
                </div>
            </div>
        `;
    }
    
    renderGamesSection(container) {
        container.innerHTML = `
            <div class="games-container">
                <div class="games-header">
                    <h1 class="page-title">Find Games</h1>
                    <div class="games-controls">
                        <div class="search-container">
                            <input type="text" class="search-input" placeholder="Search games..." id="game-search">
                            <button class="search-btn">🔍</button>
                        </div>
                        <div class="view-toggle">
                            <button class="toggle-btn active" data-view="list">List</button>
                            <button class="toggle-btn" data-view="map">Map</button>
                        </div>
                    </div>
                </div>
                
                <div class="games-filters">
                    <select class="filter-select" id="skill-filter">
                        <option value="">All Skill Levels</option>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                    </select>
                    
                    <select class="filter-select" id="time-filter">
                        <option value="">Any Time</option>
                        <option value="today">Today</option>
                        <option value="tomorrow">Tomorrow</option>
                        <option value="week">This Week</option>
                    </select>
                    
                    <button class="filter-btn" onclick="app.applyFilters()">Apply Filters</button>
                </div>
                
                <div class="games-content">
                    <div id="games-list-view" class="games-list">
                        ${this.gamesData.map(game => this.renderGameCard(game, true)).join('')}
                    </div>
                    
                    <div id="games-map-view" class="games-map-container" style="display: none;">
                        <div id="games-map" style="height: 600px; border-radius: 10px;"></div>
                    </div>
                </div>
            </div>
        `;
        
        this.bindGamesEvents();
    }
    
    renderCreateGameSection(container) {
        container.innerHTML = `
            <div class="create-game-container">
                <div class="create-header">
                    <h1 class="page-title">Create Game</h1>
                    <p class="page-subtitle">Organize a pickup game for other players to join</p>
                </div>
                
                <div class="create-form-container">
                    <form class="create-game-form" onsubmit="app.createGame(event)">
                        <div class="form-grid">
                            <div class="form-group">
                                <label class="form-label">Court Location *</label>
                                <select class="form-input" id="game-location-select" required>
                                    <option value="">Choose a court...</option>
                                    ${this.locationsData.map(loc => 
                                        `<option value="${loc.id}">${loc.name}</option>`
                                    ).join('')}
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Game Title *</label>
                                <input type="text" class="form-input" id="game-title" 
                                       placeholder="e.g., Saturday Morning Pickup" required>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Date & Time *</label>
                                <input type="datetime-local" class="form-input" id="game-datetime" required>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Max Players *</label>
                                <select class="form-input" id="game-max-players" required>
                                    <option value="6">6 players</option>
                                    <option value="8" selected>8 players</option>
                                    <option value="10">10 players</option>
                                    <option value="12">12 players</option>
                                    <option value="16">16 players</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Skill Level</label>
                                <select class="form-input" id="game-skill-level">
                                    <option value="">Any skill level</option>
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                </select>
                            </div>
                            
                            <div class="form-group full-width">
                                <label class="form-label">Game Description</label>
                                <textarea class="form-input form-textarea" id="game-description" 
                                          placeholder="Describe your game, rules, what to expect..."></textarea>
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button type="submit" class="primary-button">Create Game</button>
                            <button type="button" class="secondary-button" onclick="app.navigateTo('dashboard')">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        // Set minimum datetime to now
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        document.getElementById('game-datetime').min = now.toISOString().slice(0, 16);
    }
    
    renderLocationsSection(container) {
        container.innerHTML = `
            <div class="locations-container">
                <div class="locations-header">
                    <h1 class="page-title">Add Court</h1>
                    <p class="page-subtitle">Help other players discover great places to play</p>
                </div>
                
                <div class="locations-form-container">
                    <form class="location-form" onsubmit="app.addCourt(event)">
                        <div class="form-grid">
                            <div class="form-group">
                                <label class="form-label">Court Name *</label>
                                <input type="text" class="form-input" id="location-name" 
                                       placeholder="e.g., Central Park Basketball Court" required>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Address *</label>
                                <input type="text" class="form-input" id="location-address" 
                                       placeholder="Enter the court address" required>
                                <button type="button" class="search-address-btn" onclick="app.searchAddress()">
                                    📍 Search Address
                                </button>
                            </div>
                            
                            <div class="form-group full-width">
                                <label class="form-label">Select Location on Map *</label>
                                <div class="map-picker-container">
                                    <div id="location-picker-map" style="height: 400px; border-radius: 10px;"></div>
                                </div>
                                <div id="selected-location-info" class="selected-location" style="display: none;">
                                    <strong>Selected:</strong> <span id="selected-coords"></span>
                                </div>
                            </div>
                            
                            <div class="form-group full-width">
                                <label class="form-label">Description</label>
                                <textarea class="form-input form-textarea" id="location-description" 
                                          placeholder="Describe the court condition, features, accessibility..."></textarea>
                            </div>
                            
                            <div class="form-group full-width">
                                <label class="form-label">Amenities</label>
                                <div class="amenities-grid">
                                    <div class="amenity-chip" onclick="app.toggleAmenity(this)">💡 Lighting</div>
                                    <div class="amenity-chip" onclick="app.toggleAmenity(this)">🚰 Water Fountain</div>
                                    <div class="amenity-chip" onclick="app.toggleAmenity(this)">🚻 Restrooms</div>
                                    <div class="amenity-chip" onclick="app.toggleAmenity(this)">🅿️ Parking</div>
                                    <div class="amenity-chip" onclick="app.toggleAmenity(this)">🏢 Indoor</div>
                                    <div class="amenity-chip selected" onclick="app.toggleAmenity(this)">🌤️ Outdoor</div>
                                    <div class="amenity-chip" onclick="app.toggleAmenity(this)">🏀 Multiple Courts</div>
                                    <div class="amenity-chip" onclick="app.toggleAmenity(this)">💺 Seating</div>
                                    <div class="amenity-chip" onclick="app.toggleAmenity(this)">❄️ Air Conditioning</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button type="submit" class="primary-button">Add Court</button>
                            <button type="button" class="secondary-button" onclick="app.navigateTo('dashboard')">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        setTimeout(() => this.initLocationPicker(), 100);
    }
    
    renderProfileSection(container) {
        container.innerHTML = `
            <div class="profile-container">
                <div class="profile-header">
                    <h1 class="page-title">Your Profile</h1>
                    <p class="page-subtitle">Manage your basketball profile and stats</p>
                </div>
                
                <div class="profile-content">
                    <div class="profile-form-container">
                        <form class="profile-form" onsubmit="app.updateProfile(event)">
                            <div class="profile-avatar">
                                <div class="avatar-circle">
                                    <span class="avatar-icon">🏀</span>
                                </div>
                                <button type="button" class="change-avatar-btn">Change Avatar</button>
                            </div>
                            
                            <div class="form-grid">
                                <div class="form-group">
                                    <label class="form-label">Username</label>
                                    <input type="text" class="form-input" id="profile-username" value="${this.currentUser?.username || 'Demo Player'}" readonly>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">Email</label>
                                    <input type="email" class="form-input" id="profile-email" value="${this.currentUser?.email || 'demo@ballup.com'}" readonly>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">Skill Level</label>
                                    <select class="form-input" id="profile-skill-level">
                                        <option value="beginner" ${this.currentUser?.skillLevel === 'beginner' ? 'selected' : ''}>Beginner</option>
                                        <option value="intermediate" ${this.currentUser?.skillLevel === 'intermediate' ? 'selected' : ''}>Intermediate</option>
                                        <option value="advanced" ${this.currentUser?.skillLevel === 'advanced' ? 'selected' : ''}>Advanced</option>
                                    </select>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">Preferred Position</label>
                                    <select class="form-input" id="profile-position">
                                        <option value="" ${!this.currentUser?.position ? 'selected' : ''}>No preference</option>
                                        <option value="Point Guard" ${this.currentUser?.position === 'Point Guard' ? 'selected' : ''}>Point Guard</option>
                                        <option value="Shooting Guard" ${this.currentUser?.position === 'Shooting Guard' ? 'selected' : ''}>Shooting Guard</option>
                                        <option value="Small Forward" ${this.currentUser?.position === 'Small Forward' ? 'selected' : ''}>Small Forward</option>
                                        <option value="Power Forward" ${this.currentUser?.position === 'Power Forward' ? 'selected' : ''}>Power Forward</option>
                                        <option value="Center" ${this.currentUser?.position === 'Center' ? 'selected' : ''}>Center</option>
                                    </select>
                                </div>
                                
                                <div class="form-group full-width">
                                    <label class="form-label">Bio</label>
                                    <textarea class="form-input form-textarea" id="profile-bio" 
                                              placeholder="Tell other players about yourself...">${this.currentUser?.bio || ''}</textarea>
                                </div>
                            </div>
                            
                            <div class="form-actions">
                                <button type="submit" class="primary-button">Update Profile</button>
                                <button type="button" class="secondary-button" onclick="app.showLanding()">Logout</button>
                            </div>
                        </form>
                    </div>
                    
                    <div class="profile-stats">
                        <h3 class="stats-title">Your Stats</h3>
                        <div class="stats-grid">
                            <div class="stat-item">
                                <div class="stat-number">12</div>
                                <div class="stat-label">Games Played</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-number">8</div>
                                <div class="stat-label">Games Created</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-number">4.7</div>
                                <div class="stat-label">Rating</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-number">24</div>
                                <div class="stat-label">Friends</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderGameCard(game, detailed = false) {
        const gameTime = new Date(game.dateTime).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });
        
        return `
            <div class="game-card ${detailed ? 'detailed' : ''}">
                <div class="game-card-header">
                    <div class="game-location">${game.location?.name || 'Unknown Location'}</div>
                    <div class="game-time">${gameTime}</div>
                </div>
                
                <h3 class="game-title">${game.title}</h3>
                <p class="game-description">${game.description || 'No description provided'}</p>
                
                <div class="game-details">
                    <div class="game-detail">
                        <span class="detail-icon">👥</span>
                        <span>Players: ${game.currentPlayers}/${game.maxPlayers}</span>
                    </div>
                    <div class="game-detail">
                        <span class="detail-icon">⭐</span>
                        <span>Skill: ${game.skillLevel || 'Any'}</span>
                    </div>
                    ${detailed ? `
                        <div class="game-detail">
                            <span class="detail-icon">📍</span>
                            <span>${game.location?.address}</span>
                        </div>
                    ` : ''}
                </div>
                
                <div class="game-actions">
                    <button class="primary-button" onclick="app.joinGame('${game.id}')">
                        Join Game
                    </button>
                    ${detailed ? `
                        <button class="secondary-button" onclick="app.viewGameDetails('${game.id}')">
                            View Details
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }
    
    bindGamesEvents() {
        // View toggle
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                const view = e.target.dataset.view;
                document.getElementById('games-list-view').style.display = view === 'list' ? 'block' : 'none';
                document.getElementById('games-map-view').style.display = view === 'map' ? 'block' : 'none';
                
                if (view === 'map') {
                    setTimeout(() => this.initGamesMap(), 100);
                }
            });
        });
        
        // Search functionality
        document.getElementById('game-search').addEventListener('input', (e) => {
            this.filterGames(e.target.value);
        });
    }
    
    filterGames(searchTerm) {
        const filteredGames = this.gamesData.filter(game => 
            game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            game.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            game.location?.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        const container = document.getElementById('games-list-view');
        container.innerHTML = filteredGames.map(game => this.renderGameCard(game, true)).join('');
    }
    
    applyFilters() {
        const skillFilter = document.getElementById('skill-filter').value;
        const timeFilter = document.getElementById('time-filter').value;
        
        let filteredGames = [...this.gamesData];
        
        if (skillFilter) {
            filteredGames = filteredGames.filter(game => game.skillLevel === skillFilter);
        }
        
        if (timeFilter) {
            const now = new Date();
            const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            
            filteredGames = filteredGames.filter(game => {
                const gameDate = new Date(game.dateTime);
                switch(timeFilter) {
                    case 'today':
                        return gameDate.toDateString() === now.toDateString();
                    case 'tomorrow':
                        return gameDate.toDateString() === tomorrow.toDateString();
                    case 'week':
                        return gameDate <= weekEnd;
                    default:
                        return true;
                }
            });
        }
        
        const container = document.getElementById('games-list-view');
        container.innerHTML = filteredGames.map(game => this.renderGameCard(game, true)).join('');
    }
    
    joinGame(gameId) {
        if (!this.isAuthenticated) {
            this.showAuthSection('login');
            return;
        }
        
        const game = this.gamesData.find(g => g.id === gameId);
        if (!game) {
            this.showMessage('Game not found', 'error');
            return;
        }
        
        if (this.currentUser.joinedGames.includes(gameId)) {
            this.showMessage('You have already joined this game', 'error');
            return;
        }
        
        if (game.currentPlayers >= game.maxPlayers) {
            this.showMessage('Game is full', 'error');
            return;
        }
        
        game.currentPlayers++;
        this.currentUser.joinedGames.push(gameId);
        localStorage.setItem('ballup_user', JSON.stringify(this.currentUser));
        
        this.showMessage('Successfully joined the game!', 'success');
        this.loadAppSection(this.currentView);
    }
    
    createGame(event) {
        event.preventDefault();
        
        const locationId = document.getElementById('game-location-select').value;
        const title = document.getElementById('game-title').value;
        const datetime = document.getElementById('game-datetime').value;
        const maxPlayers = parseInt(document.getElementById('game-max-players').value);
        const skillLevel = document.getElementById('game-skill-level').value;
        const description = document.getElementById('game-description').value;
        
        if (!locationId || !title || !datetime || !maxPlayers) {
            this.showMessage('Please fill in all required fields', 'error');
            return;
        }
        
        const location = this.locationsData.find(loc => loc.id === locationId);
        
        const newGame = {
            id: Date.now().toString(),
            title,
            description,
            dateTime: datetime,
            maxPlayers,
            currentPlayers: 1,
            skillLevel: skillLevel || 'any',
            status: 'scheduled',
            location
        };
        
        this.gamesData.push(newGame);
        this.currentUser.createdGames.push(newGame.id);
        localStorage.setItem('ballup_user', JSON.stringify(this.currentUser));
        
        this.showMessage('Game created successfully!', 'success');
        
        setTimeout(() => this.navigateTo('dashboard'), 2000);
    }
    
    addCourt(event) {
        event.preventDefault();
        
        const name = document.getElementById('location-name').value;
        const address = document.getElementById('location-address').value;
        const description = document.getElementById('location-description').value;
        
        const selectedAmenities = Array.from(document.querySelectorAll('.amenity-chip.selected'))
            .map(chip => chip.textContent.trim());
        
        if (!name || !address || !this.selectedLocation) {
            this.showMessage('Please fill in all required fields and select a location on the map', 'error');
            return;
        }
        
        const newLocation = {
            id: Date.now().toString(),
            name,
            address,
            latitude: this.selectedLocation.latitude,
            longitude: this.selectedLocation.longitude,
            description,
            amenities: selectedAmenities
        };
        
        this.locationsData.push(newLocation);
        this.showMessage('Court added successfully!', 'success');
        
        setTimeout(() => this.navigateTo('dashboard'), 2000);
    }
    
    updateProfile(event) {
        event.preventDefault();
        
        const skillLevel = document.getElementById('profile-skill-level').value;
        const position = document.getElementById('profile-position').value;
        const bio = document.getElementById('profile-bio').value;
        
        this.currentUser.skillLevel = skillLevel;
        this.currentUser.position = position;
        this.currentUser.bio = bio;
        
        localStorage.setItem('ballup_user', JSON.stringify(this.currentUser));
        
        this.showMessage('Profile updated successfully!', 'success');
    }
    
    toggleAmenity(element) {
        element.classList.toggle('selected');
    }
    
    initGamesMap() {
        if (this.gamesMap) {
            this.gamesMap.remove();
        }
        
        this.gamesMap = L.map('games-map').setView([40.7831, -73.9712], 12);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.gamesMap);
        
        // Create custom icons
        const courtIcon = L.divIcon({
            className: 'court-marker',
            html: '<div class="court-icon">🏀</div>',
            iconSize: [40, 40],
            iconAnchor: [20, 20]
        });
        
        const gameIcon = L.divIcon({
            className: 'game-marker',
            html: '<div class="game-icon">⚡</div>',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });
        
        // Add all court locations first
        this.locationsData.forEach(location => {
            const marker = L.marker([location.latitude, location.longitude], { icon: courtIcon })
                .addTo(this.gamesMap);
            
            const gamesAtLocation = this.gamesData.filter(game => 
                game.location && game.location.id === location.id
            );
            
            const popupContent = `
                <div class="map-popup">
                    <h4>${location.name}</h4>
                    <p><strong>${location.address}</strong></p>
                    <p>Amenities: ${location.amenities.join(', ') || 'None listed'}</p>
                    <p>Active Games: ${gamesAtLocation.length}</p>
                    ${gamesAtLocation.length > 0 ? `
                        <div style="margin-top: 10px;">
                            <strong>Upcoming Games:</strong>
                            ${gamesAtLocation.slice(0, 3).map(game => `
                                <div style="margin: 5px 0; padding: 5px; background: rgba(255,107,53,0.1); border-radius: 5px;">
                                    <strong>${game.title}</strong><br>
                                    ${new Date(game.dateTime).toLocaleDateString()}<br>
                                    Players: ${game.currentPlayers}/${game.maxPlayers}
                                    <button class="primary-button" onclick="app.joinGame('${game.id}')" style="margin-top: 5px; padding: 4px 8px; font-size: 0.8rem;">Join</button>
                                </div>
                            `).join('')}
                        </div>
                    ` : '<p style="color: #999;">No active games at this location</p>'}
                </div>
            `;
            
            marker.bindPopup(popupContent, { maxWidth: 300 });
        });
        
        // Add game-specific markers for games with specific timing
        this.gamesData.forEach(game => {
            if (game.location) {
                // Offset the game marker slightly from the court marker
                const lat = game.location.latitude + 0.0001;
                const lng = game.location.longitude + 0.0001;
                
                const marker = L.marker([lat, lng], { icon: gameIcon })
                    .addTo(this.gamesMap);
                
                const popupContent = `
                    <div class="map-popup">
                        <h4>🏀 ${game.title}</h4>
                        <p><strong>📍 ${game.location.name}</strong></p>
                        <p>📅 ${new Date(game.dateTime).toLocaleDateString()}</p>
                        <p>🕐 ${new Date(game.dateTime).toLocaleTimeString()}</p>
                        <p>👥 Players: ${game.currentPlayers}/${game.maxPlayers}</p>
                        <p>⭐ Skill: ${game.skillLevel}</p>
                        <button class="primary-button" onclick="app.joinGame('${game.id}')">Join Game</button>
                    </div>
                `;
                
                marker.bindPopup(popupContent);
            }
        });
    }
    
    initLocationPicker() {
        if (this.locationPickerMap) {
            this.locationPickerMap.remove();
        }
        
        this.locationPickerMap = L.map('location-picker-map').setView([40.7831, -73.9712], 12);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.locationPickerMap);
        
        let selectedMarker = null;
        
        this.locationPickerMap.on('click', (e) => {
            const lat = e.latlng.lat;
            const lng = e.latlng.lng;
            
            this.selectedLocation = { latitude: lat, longitude: lng };
            
            if (selectedMarker) {
                this.locationPickerMap.removeLayer(selectedMarker);
            }
            
            selectedMarker = L.marker([lat, lng]).addTo(this.locationPickerMap);
            
            document.getElementById('selected-location-info').style.display = 'block';
            document.getElementById('selected-coords').textContent = 
                `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            
            this.reverseGeocode(lat, lng);
        });
    }
    
    async reverseGeocode(lat, lng) {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await response.json();
            
            if (data.display_name) {
                document.getElementById('location-address').value = data.display_name;
            }
        } catch (error) {
            console.error('Reverse geocoding failed:', error);
        }
    }
    
    async searchAddress() {
        const address = document.getElementById('location-address').value;
        if (!address) {
            this.showMessage('Please enter an address to search', 'error');
            return;
        }
        
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`);
            const data = await response.json();
            
            if (data.length > 0) {
                const lat = parseFloat(data[0].lat);
                const lng = parseFloat(data[0].lon);
                
                this.locationPickerMap.setView([lat, lng], 15);
                
                this.selectedLocation = { latitude: lat, longitude: lng };
                
                if (this.locationPickerMap.selectedMarker) {
                    this.locationPickerMap.removeLayer(this.locationPickerMap.selectedMarker);
                }
                
                this.locationPickerMap.selectedMarker = L.marker([lat, lng]).addTo(this.locationPickerMap);
                
                document.getElementById('selected-location-info').style.display = 'block';
                document.getElementById('selected-coords').textContent = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            } else {
                this.showMessage('Address not found. Please try a different search term.', 'error');
            }
        } catch (error) {
            console.error('Geocoding failed:', error);
            this.showMessage('Failed to search address. Please try again.', 'error');
        }
    }
    
    showMessage(message, type) {
        // Create message element
        const messageEl = document.createElement('div');
        messageEl.className = `message ${type}`;
        messageEl.textContent = message;
        
        // Add to page
        document.body.appendChild(messageEl);
        
        // Remove after 3 seconds
        setTimeout(() => {
            messageEl.remove();
        }, 3000);
    }
    
    showLanding() {
        window.showLanding();
    }
    
    // Authentication methods
    checkAuth() {
        const userData = localStorage.getItem('rutgersballup_user');
        if (userData) {
            this.currentUser = JSON.parse(userData);
            this.isAuthenticated = true;
        }
    }
    
    showAuthSection(type) {
        document.getElementById('landing-page').style.display = 'none';
        document.getElementById('app-interface').classList.add('active');
        
        const content = document.getElementById('app-content');
        if (type === 'login') {
            this.renderLoginSection(content);
        } else {
            this.renderRegisterSection(content);
        }
    }
    
    renderLoginSection(container) {
        container.innerHTML = `
            <div class="auth-container">
                <div class="auth-header">
                    <h1 class="page-title">Welcome Back</h1>
                    <p class="page-subtitle">Sign in to your RutgersBallUp account</p>
                </div>
                
                <div class="auth-form-container">
                    <form class="auth-form" onsubmit="app.handleLogin(event)">
                        <div class="form-group">
                            <label class="form-label">Email</label>
                            <input type="email" class="form-input" id="login-email" required
                                   placeholder="Enter your email address">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Password</label>
                            <input type="password" class="form-input" id="login-password" required
                                   placeholder="Enter your password">
                        </div>
                        
                        <div class="form-actions">
                            <button type="submit" class="primary-button full-width">Sign In</button>
                        </div>
                        
                        <div class="auth-links">
                            <p>Don't have an account? 
                                <a href="#" onclick="app.showAuthSection('register')">Sign up</a>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }
    
    renderRegisterSection(container) {
        container.innerHTML = `
            <div class="auth-container">
                <div class="auth-header">
                    <h1 class="page-title">Join RutgersBallUp</h1>
                    <p class="page-subtitle">Create your account to start playing</p>
                </div>
                
                <div class="auth-form-container">
                    <form class="auth-form" onsubmit="app.handleRegister(event)">
                        <div class="form-grid">
                            <div class="form-group">
                                <label class="form-label">Username</label>
                                <input type="text" class="form-input" id="register-username" required
                                       placeholder="Choose a username">
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Email</label>
                                <input type="email" class="form-input" id="register-email" required
                                       placeholder="Enter your email">
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Password</label>
                                <input type="password" class="form-input" id="register-password" required
                                       placeholder="Create a password">
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Confirm Password</label>
                                <input type="password" class="form-input" id="register-confirm" required
                                       placeholder="Confirm your password">
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button type="submit" class="primary-button full-width">Create Account</button>
                        </div>
                        
                        <div class="auth-links">
                            <p>Already have an account? 
                                <a href="#" onclick="app.showAuthSection('login')">Sign in</a>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }
    
    handleLogin(event) {
        event.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        // Simple demo authentication
        if (email && password) {
            this.currentUser = {
                id: Date.now().toString(),
                email: email,
                username: email.split('@')[0],
                skillLevel: 'intermediate',
                position: 'Shooting Guard',
                bio: 'Love playing basketball and meeting new people!',
                joinedGames: [],
                createdGames: []
            };
            
            localStorage.setItem('rutgersballup_user', JSON.stringify(this.currentUser));
            this.isAuthenticated = true;
            
            this.showMessage('Successfully signed in!', 'success');
            setTimeout(() => this.navigateTo('dashboard'), 1000);
        } else {
            this.showMessage('Please enter valid credentials', 'error');
        }
    }
    
    handleRegister(event) {
        event.preventDefault();
        
        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirm = document.getElementById('register-confirm').value;
        
        if (password !== confirm) {
            this.showMessage('Passwords do not match', 'error');
            return;
        }
        
        if (username && email && password) {
            this.currentUser = {
                id: Date.now().toString(),
                email: email,
                username: username,
                skillLevel: 'beginner',
                position: '',
                bio: '',
                joinedGames: [],
                createdGames: []
            };
            
            localStorage.setItem('ballup_user', JSON.stringify(this.currentUser));
            this.isAuthenticated = true;
            
            this.showMessage('Account created successfully!', 'success');
            setTimeout(() => this.navigateTo('dashboard'), 1000);
        } else {
            this.showMessage('Please fill in all fields', 'error');
        }
    }
    
    logout() {
        localStorage.removeItem('rutgersballup_user');
        this.currentUser = null;
        this.isAuthenticated = false;
        this.showLanding();
        this.showMessage('Logged out successfully', 'success');
    }
    
    // My Games section
    renderMyGamesSection(container) {
        const userGames = this.gamesData.filter(game => 
            this.currentUser.createdGames.includes(game.id) || 
            this.currentUser.joinedGames.includes(game.id)
        );
        
        const createdGames = userGames.filter(game => 
            this.currentUser.createdGames.includes(game.id)
        );
        
        const joinedGames = userGames.filter(game => 
            this.currentUser.joinedGames.includes(game.id)
        );
        
        container.innerHTML = `
            <div class="mygames-container">
                <div class="mygames-header">
                    <h1 class="page-title">My Games</h1>
                    <p class="page-subtitle">Manage your created and joined games</p>
                </div>
                
                <div class="mygames-content">
                    <div class="games-section">
                        <h2 class="section-title">Created Games (${createdGames.length})</h2>
                        <div class="games-grid">
                            ${createdGames.length > 0 ? 
                                createdGames.map(game => this.renderMyGameCard(game, 'creator')).join('') :
                                '<div class="empty-state">No games created yet. <a href="#" data-nav="create">Create your first game!</a></div>'
                            }
                        </div>
                    </div>
                    
                    <div class="games-section">
                        <h2 class="section-title">Joined Games (${joinedGames.length})</h2>
                        <div class="games-grid">
                            ${joinedGames.length > 0 ? 
                                joinedGames.map(game => this.renderMyGameCard(game, 'participant')).join('') :
                                '<div class="empty-state">No games joined yet. <a href="#" data-nav="games">Find games to join!</a></div>'
                            }
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderMyGameCard(game, role) {
        const gameTime = new Date(game.dateTime).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });
        
        return `
            <div class="game-card detailed">
                <div class="game-card-header">
                    <div class="game-location">${game.location?.name || 'Unknown Location'}</div>
                    <div class="game-time">${gameTime}</div>
                </div>
                
                <h3 class="game-title">${game.title}</h3>
                <p class="game-description">${game.description || 'No description provided'}</p>
                
                <div class="game-details">
                    <div class="game-detail">
                        <span class="detail-icon">👥</span>
                        <span>Players: ${game.currentPlayers}/${game.maxPlayers}</span>
                    </div>
                    <div class="game-detail">
                        <span class="detail-icon">⭐</span>
                        <span>Skill: ${game.skillLevel || 'Any'}</span>
                    </div>
                    <div class="game-detail">
                        <span class="detail-icon">🎯</span>
                        <span>Role: ${role === 'creator' ? 'Creator' : 'Participant'}</span>
                    </div>
                </div>
                
                <div class="game-actions">
                    ${role === 'creator' ? 
                        `<button class="secondary-button" onclick="app.cancelGame('${game.id}')">Cancel Game</button>` :
                        `<button class="secondary-button" onclick="app.leaveGame('${game.id}')">Leave Game</button>`
                    }
                    <button class="primary-button" onclick="app.viewGameDetails('${game.id}')">View Details</button>
                </div>
            </div>
        `;
    }
    
    cancelGame(gameId) {
        const gameIndex = this.gamesData.findIndex(g => g.id === gameId);
        if (gameIndex !== -1) {
            this.gamesData.splice(gameIndex, 1);
            this.currentUser.createdGames = this.currentUser.createdGames.filter(id => id !== gameId);
            localStorage.setItem('ballup_user', JSON.stringify(this.currentUser));
            this.showMessage('Game cancelled successfully', 'success');
            this.renderMyGamesSection(document.getElementById('app-content'));
        }
    }
    
    leaveGame(gameId) {
        const game = this.gamesData.find(g => g.id === gameId);
        if (game) {
            game.currentPlayers--;
            this.currentUser.joinedGames = this.currentUser.joinedGames.filter(id => id !== gameId);
            localStorage.setItem('ballup_user', JSON.stringify(this.currentUser));
            this.showMessage('Left game successfully', 'success');
            this.renderMyGamesSection(document.getElementById('app-content'));
        }
    }
    
    viewGameDetails(gameId) {
        // For now, just navigate to games section
        this.navigateTo('games');
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new BallUpApp();
});