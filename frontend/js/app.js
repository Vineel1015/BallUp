// RutgersBallUp Frontend Application - Fully Functional
class BallUpApp {
    constructor() {
        this.apiBaseUrl = 'http://localhost:3000/api';
        this.currentView = 'dashboard';
        this.currentUser = null;
        this.isAuthenticated = false;
        this.isAppMode = false;
        this.token = null;
        this.gamesData = [];
        this.locationsData = [];
        this.gamesMap = null;
        this.locationPickerMap = null;
        this.selectedLocation = null;
        
        this.checkAuth();
        this.bindEvents();
    }
    
    // Authentication Methods
    checkAuth() {
        this.token = localStorage.getItem('ballup_token');
        const userData = localStorage.getItem('ballup_user');
        
        if (this.token && userData) {
            try {
                this.currentUser = JSON.parse(userData);
                this.isAuthenticated = true;
                console.log('User authenticated:', this.currentUser.username);
            } catch (error) {
                console.error('Error parsing user data:', error);
                this.logout();
            }
        }
    }
    
    async makeAuthenticatedRequest(endpoint, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        
        if (this.token) {
            headers.Authorization = `Bearer ${this.token}`;
        }
        
        const response = await fetch(`${this.apiBaseUrl}${endpoint}`, {
            ...options,
            headers
        });
        
        if (response.status === 401) {
            this.logout();
            throw new Error('Authentication required');
        }
        
        return response;
    }
    
    // Navigation and UI Methods
    bindEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-nav]')) {
                e.preventDefault();
                this.navigateTo(e.target.dataset.nav);
            }
        });
    }
    
    showApp() {
        this.isAppMode = true;
        document.getElementById('landing-page').style.display = 'none';
        document.getElementById('app-interface').classList.add('active');
        
        if (!this.isAuthenticated) {
            this.showAuthSection('login');
        } else {
            this.navigateTo('dashboard');
        }
    }
    
    showLanding() {
        this.isAppMode = false;
        document.getElementById('landing-page').style.display = 'block';
        document.getElementById('app-interface').classList.remove('active');
    }
    
    navigateTo(section) {
        if (!this.isAuthenticated && section !== 'login' && section !== 'register') {
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
        const appInterface = document.getElementById('app-interface');
        
        switch(section) {
            case 'dashboard':
                this.renderDashboard(appInterface);
                break;
            case 'games':
                this.renderGamesSection(appInterface);
                break;
            case 'create':
                this.renderCreateGameSection(appInterface);
                break;
            case 'profile':
                this.renderProfileSection(appInterface);
                break;
            case 'locations':
                this.renderLocationsSection(appInterface);
                break;
            case 'mygames':
                this.renderMyGamesSection(appInterface);
                break;
            case 'login':
                this.showAuthSection('login');
                break;
            case 'register':
                this.showAuthSection('register');
                break;
            default:
                this.renderDashboard(appInterface);
        }
    }
    
    // Authentication UI Methods
    showAuthSection(type) {
        const appInterface = document.getElementById('app-interface');
        appInterface.innerHTML = `
            <div class="app-header">
                <div class="app-nav" style="justify-content: center;">
                    <a href="#" class="logo" onclick="ballUpApp.showLanding()">🏀 RutgersBallUp</a>
                </div>
            </div>
            <div class="app-content" id="app-content">
                <!-- Auth content will be loaded here -->
            </div>
        `;
        
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
                    <form class="auth-form" onsubmit="ballUpApp.handleLogin(event)">
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
                                <a href="#" onclick="ballUpApp.showAuthSection('register')">Sign up</a>
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
                    <form class="auth-form" onsubmit="ballUpApp.handleRegister(event)">
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
                                       placeholder="Create a password" minlength="8">
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Confirm Password</label>
                                <input type="password" class="form-input" id="register-confirm" required
                                       placeholder="Confirm your password">
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">First Name</label>
                                <input type="text" class="form-input" id="register-firstname"
                                       placeholder="Your first name">
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Last Name</label>
                                <input type="text" class="form-input" id="register-lastname"
                                       placeholder="Your last name">
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button type="submit" class="primary-button full-width">Create Account</button>
                        </div>
                        
                        <div class="auth-links">
                            <p>Already have an account? 
                                <a href="#" onclick="ballUpApp.showAuthSection('login')">Sign in</a>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }
    
    async handleLogin(event) {
        event.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const submitButton = event.target.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        
        try {
            submitButton.innerHTML = '<span class="loading-spinner"></span> Signing In...';
            submitButton.disabled = true;
            
            const response = await fetch(`${this.apiBaseUrl}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (response.ok && data.token) {
                localStorage.setItem('ballup_token', data.token);
                localStorage.setItem('ballup_user', JSON.stringify(data.user));
                
                this.token = data.token;
                this.currentUser = data.user;
                this.isAuthenticated = true;
                
                this.showMessage('Successfully signed in!', 'success');
                
                // Check if user is admin and redirect accordingly
                if (data.user.role === 'admin' || data.user.role === 'super_admin') {
                    setTimeout(() => {
                        window.location.href = '/admin.html';
                    }, 1000);
                } else {
                    setTimeout(() => this.navigateTo('dashboard'), 1000);
                }
            } else {
                this.showMessage(data.error || 'Login failed. Please check your credentials.', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showMessage('Network error. Please check if the backend server is running.', 'error');
        } finally {
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    }
    
    async handleRegister(event) {
        event.preventDefault();
        
        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirm = document.getElementById('register-confirm').value;
        const firstName = document.getElementById('register-firstname').value;
        const lastName = document.getElementById('register-lastname').value;
        const submitButton = event.target.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        
        if (password !== confirm) {
            this.showMessage('Passwords do not match', 'error');
            return;
        }
        
        try {
            submitButton.innerHTML = '<span class="loading-spinner"></span> Creating Account...';
            submitButton.disabled = true;
            
            const requestData = { username, email, password };
            if (firstName) requestData.firstName = firstName;
            if (lastName) requestData.lastName = lastName;
            
            const response = await fetch(`${this.apiBaseUrl}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData)
            });
            
            const data = await response.json();
            
            if (response.ok && data.token) {
                localStorage.setItem('ballup_token', data.token);
                localStorage.setItem('ballup_user', JSON.stringify(data.user));
                
                this.token = data.token;
                this.currentUser = data.user;
                this.isAuthenticated = true;
                
                this.showMessage('Account created successfully!', 'success');
                setTimeout(() => this.navigateTo('dashboard'), 1000);
            } else {
                this.showMessage(data.error || 'Registration failed. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.showMessage('Network error. Please check if the backend server is running.', 'error');
        } finally {
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    }
    
    logout() {
        localStorage.removeItem('ballup_token');
        localStorage.removeItem('ballup_user');
        this.token = null;
        this.currentUser = null;
        this.isAuthenticated = false;
        this.showLanding();
        this.showMessage('Logged out successfully', 'success');
    }
    
    // App UI Rendering Methods
    renderAppHeader() {
        return `
            <div class="app-header">
                <div class="app-nav">
                    <a href="#" class="logo" onclick="ballUpApp.showLanding()">🏀 RutgersBallUp</a>
                    <div style="display: flex; gap: 30px; align-items: center;">
                        <a href="#" data-nav="dashboard" style="color: white; text-decoration: none;">Dashboard</a>
                        <a href="#" data-nav="games" style="color: white; text-decoration: none;">Find Games</a>
                        <a href="#" data-nav="create" style="color: white; text-decoration: none;">Create Game</a>
                        <a href="#" data-nav="locations" style="color: white; text-decoration: none;">Add Court</a>
                        <a href="#" data-nav="mygames" style="color: white; text-decoration: none;">My Games</a>
                        <a href="#" data-nav="profile" style="color: white; text-decoration: none;">Profile</a>
                        <button class="secondary-button" onclick="ballUpApp.logout()" style="padding: 8px 16px; font-size: 14px;">Logout</button>
                    </div>
                </div>
            </div>
        `;
    }
    
    async renderDashboard(container) {
        container.innerHTML = `
            ${this.renderAppHeader()}
            <div class="app-content">
                <div class="dashboard-container">
                    <div class="dashboard-header">
                        <h1 class="dashboard-title">Welcome back, ${this.currentUser.firstName || this.currentUser.username}!</h1>
                        <p class="dashboard-subtitle">Ready to find your next game?</p>
                    </div>
                    
                    <div class="stats-grid" id="stats-grid">
                        <div class="stat-card">
                            <div class="stat-icon">🏀</div>
                            <div class="stat-number" id="available-games">-</div>
                            <div class="stat-label">Available Games</div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-icon">📍</div>
                            <div class="stat-number" id="active-courts">-</div>
                            <div class="stat-label">Active Courts</div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-icon">👥</div>
                            <div class="stat-number">${this.currentUser.gamesPlayed || 0}</div>
                            <div class="stat-label">Games Played</div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-icon">⭐</div>
                            <div class="stat-number">${this.currentUser.rating ? this.currentUser.rating.toFixed(1) : '4.5'}</div>
                            <div class="stat-label">Your Rating</div>
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
                        <h2 class="section-title">Nearby Games</h2>
                        <div class="games-grid" id="recent-games-grid">
                            <div class="loading-message">Loading games...</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Load dashboard data
        await this.loadDashboardData();
    }
    
    async loadDashboardData() {
        try {
            // Load games and locations data
            const [gamesResponse, locationsResponse] = await Promise.all([
                this.makeAuthenticatedRequest('/games'),
                this.makeAuthenticatedRequest('/locations')
            ]);
            
            if (gamesResponse.ok) {
                this.gamesData = await gamesResponse.json();
                document.getElementById('available-games').textContent = this.gamesData.length;
                
                // Show recent games
                const recentGamesGrid = document.getElementById('recent-games-grid');
                if (this.gamesData.length > 0) {
                    recentGamesGrid.innerHTML = this.gamesData.slice(0, 3).map(game => this.renderGameCard(game)).join('');
                } else {
                    recentGamesGrid.innerHTML = '<div class="empty-state">No games available. <a href="#" data-nav="create">Create the first one!</a></div>';
                }
            }
            
            if (locationsResponse.ok) {
                this.locationsData = await locationsResponse.json();
                document.getElementById('active-courts').textContent = this.locationsData.length;
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            document.getElementById('recent-games-grid').innerHTML = '<div class="error-state">Error loading games</div>';
        }
    }
    
    async renderGamesSection(container) {
        container.innerHTML = `
            ${this.renderAppHeader()}
            <div class="app-content">
                <div class="games-container">
                    <div class="games-header">
                        <h1 class="page-title">Find Games</h1>
                        <div class="games-controls">
                            <div class="search-container">
                                <input type="text" class="search-input" placeholder="Search games..." id="game-search">
                                <button class="search-btn" onclick="ballUpApp.searchGames()">🔍</button>
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
                        
                        <select class="filter-select" id="status-filter">
                            <option value="">All Status</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="starting">Starting Soon</option>
                        </select>
                        
                        <button class="filter-btn" onclick="ballUpApp.applyFilters()">Apply Filters</button>
                        <button class="secondary-button" onclick="ballUpApp.clearFilters()">Clear</button>
                    </div>
                    
                    <div class="games-content">
                        <div id="games-list-view" class="games-list">
                            <div class="loading-message">Loading games...</div>
                        </div>
                        
                        <div id="games-map-view" class="games-map-container" style="display: none;">
                            <div id="games-map" style="height: 600px; border-radius: 10px;"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.bindGamesEvents();
        await this.loadGames();
    }
    
    async loadGames(filters = {}) {
        try {
            let url = '/games';
            const params = new URLSearchParams();
            
            if (filters.skillLevel) params.append('skillLevel', filters.skillLevel);
            if (filters.status) params.append('status', filters.status);
            if (filters.search) params.append('search', filters.search);
            
            if (params.toString()) {
                url += '?' + params.toString();
            }
            
            const response = await this.makeAuthenticatedRequest(url);
            
            if (response.ok) {
                this.gamesData = await response.json();
                this.displayGames(this.gamesData);
            } else {
                throw new Error('Failed to load games');
            }
        } catch (error) {
            console.error('Error loading games:', error);
            document.getElementById('games-list-view').innerHTML = '<div class="error-state">Error loading games. Please try again.</div>';
        }
    }
    
    displayGames(games) {
        const container = document.getElementById('games-list-view');
        
        if (games.length === 0) {
            container.innerHTML = '<div class="empty-state">No games found. <a href="#" data-nav="create">Create a new game!</a></div>';
            return;
        }
        
        container.innerHTML = games.map(game => this.renderGameCard(game, true)).join('');
    }
    
    renderGameCard(game, detailed = false) {
        const gameTime = new Date(game.scheduledAt).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });
        
        const isCreator = this.currentUser && game.creatorId === this.currentUser.id;
        const isParticipant = game.participants && game.participants.some(p => p.userId === this.currentUser.id && p.status === 'joined');
        const canJoin = game.currentPlayers < game.maxPlayers && !isCreator && !isParticipant;
        
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
                    <div class="game-detail">
                        <span class="detail-icon">🎮</span>
                        <span>Type: ${game.gameType || 'Pickup'}</span>
                    </div>
                    ${detailed && game.location ? `
                        <div class="game-detail">
                            <span class="detail-icon">📍</span>
                            <span>${game.location.address}</span>
                        </div>
                    ` : ''}
                </div>
                
                <div class="game-actions">
                    ${canJoin ? `
                        <button class="primary-button" onclick="ballUpApp.joinGame('${game.id}')">
                            Join Game
                        </button>
                    ` : isParticipant ? `
                        <button class="secondary-button" onclick="ballUpApp.leaveGame('${game.id}')">
                            Leave Game
                        </button>
                    ` : isCreator ? `
                        <button class="secondary-button" onclick="ballUpApp.editGame('${game.id}')">
                            Edit Game
                        </button>
                    ` : `
                        <button class="primary-button" disabled>
                            Game Full
                        </button>
                    `}
                    ${detailed ? `
                        <button class="secondary-button" onclick="ballUpApp.viewGameDetails('${game.id}')">
                            View Details
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }
    
    async joinGame(gameId) {
        try {
            const response = await this.makeAuthenticatedRequest(`/games/${gameId}/join`, {
                method: 'POST'
            });
            
            if (response.ok) {
                this.showMessage('Successfully joined the game!', 'success');
                await this.loadGames();
            } else {
                const error = await response.json();
                this.showMessage(error.error || 'Failed to join game', 'error');
            }
        } catch (error) {
            console.error('Error joining game:', error);
            this.showMessage('Error joining game. Please try again.', 'error');
        }
    }
    
    async leaveGame(gameId) {
        try {
            const response = await this.makeAuthenticatedRequest(`/games/${gameId}/leave`, {
                method: 'POST'
            });
            
            if (response.ok) {
                this.showMessage('Successfully left the game', 'success');
                await this.loadGames();
            } else {
                const error = await response.json();
                this.showMessage(error.error || 'Failed to leave game', 'error');
            }
        } catch (error) {
            console.error('Error leaving game:', error);
            this.showMessage('Error leaving game. Please try again.', 'error');
        }
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
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                this.searchGames(e.target.value);
            }, 300);
        });
    }
    
    async searchGames(query = '') {
        const searchTerm = query || document.getElementById('game-search').value;
        const filters = { search: searchTerm };
        await this.loadGames(filters);
    }
    
    async applyFilters() {
        const skillFilter = document.getElementById('skill-filter').value;
        const statusFilter = document.getElementById('status-filter').value;
        const searchTerm = document.getElementById('game-search').value;
        
        const filters = {};
        if (skillFilter) filters.skillLevel = skillFilter;
        if (statusFilter) filters.status = statusFilter;
        if (searchTerm) filters.search = searchTerm;
        
        await this.loadGames(filters);
    }
    
    clearFilters() {
        document.getElementById('skill-filter').value = '';
        document.getElementById('status-filter').value = '';
        document.getElementById('game-search').value = '';
        this.loadGames();
    }
    
    // Create Game Section
    async renderCreateGameSection(container) {
        container.innerHTML = `
            ${this.renderAppHeader()}
            <div class="app-content">
                <div class="create-game-container">
                    <div class="create-header">
                        <h1 class="page-title">Create Game</h1>
                        <p class="page-subtitle">Organize a pickup game for other players to join</p>
                    </div>
                    
                    <div class="create-form-container">
                        <form class="create-game-form" onsubmit="ballUpApp.createGame(event)">
                            <div class="form-grid">
                                <div class="form-group">
                                    <label class="form-label">Court Location *</label>
                                    <select class="form-input" id="game-location-select" required>
                                        <option value="">Loading courts...</option>
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
                                        <option value="20">20 players</option>
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
                                
                                <div class="form-group">
                                    <label class="form-label">Game Type</label>
                                    <select class="form-input" id="game-type">
                                        <option value="pickup">Pickup Game</option>
                                        <option value="scrimmage">Scrimmage</option>
                                        <option value="tournament">Tournament</option>
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
                                <button type="button" class="secondary-button" onclick="ballUpApp.navigateTo('dashboard')">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        // Set minimum datetime to now
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        document.getElementById('game-datetime').min = now.toISOString().slice(0, 16);
        
        // Load locations for the dropdown
        await this.loadLocationsForForm();
    }
    
    async loadLocationsForForm() {
        try {
            const response = await this.makeAuthenticatedRequest('/locations');
            
            if (response.ok) {
                this.locationsData = await response.json();
                const select = document.getElementById('game-location-select');
                
                if (this.locationsData.length === 0) {
                    select.innerHTML = '<option value="">No courts available - Add one first!</option>';
                } else {
                    select.innerHTML = `
                        <option value="">Choose a court...</option>
                        ${this.locationsData.map(loc => 
                            `<option value="${loc.id}">${loc.name} - ${loc.address}</option>`
                        ).join('')}
                    `;
                }
            }
        } catch (error) {
            console.error('Error loading locations:', error);
            const select = document.getElementById('game-location-select');
            select.innerHTML = '<option value="">Error loading courts</option>';
        }
    }
    
    async createGame(event) {
        event.preventDefault();
        
        const locationId = document.getElementById('game-location-select').value;
        const title = document.getElementById('game-title').value;
        const scheduledTime = document.getElementById('game-datetime').value;
        const maxPlayers = parseInt(document.getElementById('game-max-players').value);
        const skillLevel = document.getElementById('game-skill-level').value;
        const gameType = document.getElementById('game-type').value;
        const description = document.getElementById('game-description').value;
        const submitButton = event.target.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        
        if (!locationId) {
            this.showMessage('Please select a court location', 'error');
            return;
        }
        
        try {
            submitButton.innerHTML = '<span class="loading-spinner"></span> Creating Game...';
            submitButton.disabled = true;
            
            const gameData = {
                locationId,
                title,
                scheduledTime,
                maxPlayers,
                gameType: gameType || 'pickup'
            };
            
            if (skillLevel) gameData.skillLevel = skillLevel;
            if (description) gameData.description = description;
            
            const response = await this.makeAuthenticatedRequest('/games', {
                method: 'POST',
                body: JSON.stringify(gameData)
            });
            
            if (response.ok) {
                this.showMessage('Game created successfully!', 'success');
                setTimeout(() => this.navigateTo('mygames'), 2000);
            } else {
                const error = await response.json();
                this.showMessage(error.error || 'Failed to create game', 'error');
            }
        } catch (error) {
            console.error('Error creating game:', error);
            this.showMessage('Error creating game. Please try again.', 'error');
        } finally {
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    }
    
    // Locations Section
    async renderLocationsSection(container) {
        container.innerHTML = `
            ${this.renderAppHeader()}
            <div class="app-content">
                <div class="locations-container">
                    <div class="locations-header">
                        <h1 class="page-title">Add Court</h1>
                        <p class="page-subtitle">Help other players discover great places to play</p>
                    </div>
                    
                    <div class="locations-form-container">
                        <form class="location-form" onsubmit="ballUpApp.addCourt(event)">
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
                                    <button type="button" class="search-address-btn" onclick="ballUpApp.searchAddress()">
                                        📍 Search Address
                                    </button>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">Court Type</label>
                                    <select class="form-input" id="court-type">
                                        <option value="outdoor">Outdoor</option>
                                        <option value="indoor">Indoor</option>
                                        <option value="hybrid">Hybrid</option>
                                    </select>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">Surface Type</label>
                                    <select class="form-input" id="surface-type">
                                        <option value="asphalt">Asphalt</option>
                                        <option value="concrete">Concrete</option>
                                        <option value="hardwood">Hardwood</option>
                                        <option value="rubber">Rubber</option>
                                    </select>
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
                                        <div class="amenity-chip" onclick="ballUpApp.toggleAmenity(this)" data-amenity="lighting">💡 Lighting</div>
                                        <div class="amenity-chip" onclick="ballUpApp.toggleAmenity(this)" data-amenity="water">🚰 Water Fountain</div>
                                        <div class="amenity-chip" onclick="ballUpApp.toggleAmenity(this)" data-amenity="restrooms">🚻 Restrooms</div>
                                        <div class="amenity-chip" onclick="ballUpApp.toggleAmenity(this)" data-amenity="parking">🅿️ Parking</div>
                                        <div class="amenity-chip" onclick="ballUpApp.toggleAmenity(this)" data-amenity="seating">💺 Seating</div>
                                        <div class="amenity-chip" onclick="ballUpApp.toggleAmenity(this)" data-amenity="multiple_courts">🏀 Multiple Courts</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="form-actions">
                                <button type="submit" class="primary-button">Add Court</button>
                                <button type="button" class="secondary-button" onclick="ballUpApp.navigateTo('dashboard')">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        setTimeout(() => this.initLocationPicker(), 100);
    }
    
    initLocationPicker() {
        if (this.locationPickerMap) {
            this.locationPickerMap.remove();
        }
        
        // Default to New Brunswick, NJ area (Rutgers)
        this.locationPickerMap = L.map('location-picker-map').setView([40.4862, -74.4518], 12);
        
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
    
    toggleAmenity(element) {
        element.classList.toggle('selected');
    }
    
    async addCourt(event) {
        event.preventDefault();
        
        const name = document.getElementById('location-name').value;
        const address = document.getElementById('location-address').value;
        const courtType = document.getElementById('court-type').value;
        const surfaceType = document.getElementById('surface-type').value;
        const description = document.getElementById('location-description').value;
        const submitButton = event.target.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        
        const selectedAmenities = Array.from(document.querySelectorAll('.amenity-chip.selected'))
            .map(chip => chip.dataset.amenity);
        
        if (!this.selectedLocation) {
            this.showMessage('Please select a location on the map', 'error');
            return;
        }
        
        try {
            submitButton.innerHTML = '<span class="loading-spinner"></span> Adding Court...';
            submitButton.disabled = true;
            
            const locationData = {
                name,
                address,
                latitude: this.selectedLocation.latitude,
                longitude: this.selectedLocation.longitude,
                courtType,
                surfaceType,
                amenities: selectedAmenities
            };
            
            if (description) locationData.description = description;
            
            const response = await this.makeAuthenticatedRequest('/locations', {
                method: 'POST',
                body: JSON.stringify(locationData)
            });
            
            if (response.ok) {
                this.showMessage('Court added successfully!', 'success');
                setTimeout(() => this.navigateTo('dashboard'), 2000);
            } else {
                const error = await response.json();
                this.showMessage(error.error || 'Failed to add court', 'error');
            }
        } catch (error) {
            console.error('Error adding court:', error);
            this.showMessage('Error adding court. Please try again.', 'error');
        } finally {
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    }
    
    // Profile Section
    async renderProfileSection(container) {
        container.innerHTML = `
            ${this.renderAppHeader()}
            <div class="app-content">
                <div class="profile-container">
                    <div class="profile-header">
                        <h1 class="page-title">Your Profile</h1>
                        <p class="page-subtitle">Manage your basketball profile and stats</p>
                    </div>
                    
                    <div class="profile-content">
                        <div class="profile-form-container">
                            <form class="profile-form" onsubmit="ballUpApp.updateProfile(event)">
                                <div class="profile-avatar">
                                    <div class="avatar-circle">
                                        <span class="avatar-icon">${this.currentUser.profilePicture || '🏀'}</span>
                                    </div>
                                    <button type="button" class="change-avatar-btn">Change Avatar</button>
                                </div>
                                
                                <div class="form-grid">
                                    <div class="form-group">
                                        <label class="form-label">Username</label>
                                        <input type="text" class="form-input" value="${this.currentUser.username}" readonly>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label class="form-label">Email</label>
                                        <input type="email" class="form-input" value="${this.currentUser.email}" readonly>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label class="form-label">First Name</label>
                                        <input type="text" class="form-input" id="profile-firstname" value="${this.currentUser.firstName || ''}">
                                    </div>
                                    
                                    <div class="form-group">
                                        <label class="form-label">Last Name</label>
                                        <input type="text" class="form-input" id="profile-lastname" value="${this.currentUser.lastName || ''}">
                                    </div>
                                    
                                    <div class="form-group">
                                        <label class="form-label">Skill Level</label>
                                        <select class="form-input" id="profile-skill-level">
                                            <option value="beginner" ${this.currentUser.skillLevel === 'beginner' ? 'selected' : ''}>Beginner</option>
                                            <option value="intermediate" ${this.currentUser.skillLevel === 'intermediate' ? 'selected' : ''}>Intermediate</option>
                                            <option value="advanced" ${this.currentUser.skillLevel === 'advanced' ? 'selected' : ''}>Advanced</option>
                                        </select>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label class="form-label">Preferred Position</label>
                                        <select class="form-input" id="profile-position">
                                            <option value="" ${!this.currentUser.preferredPosition ? 'selected' : ''}>No preference</option>
                                            <option value="Point Guard" ${this.currentUser.preferredPosition === 'Point Guard' ? 'selected' : ''}>Point Guard</option>
                                            <option value="Shooting Guard" ${this.currentUser.preferredPosition === 'Shooting Guard' ? 'selected' : ''}>Shooting Guard</option>
                                            <option value="Small Forward" ${this.currentUser.preferredPosition === 'Small Forward' ? 'selected' : ''}>Small Forward</option>
                                            <option value="Power Forward" ${this.currentUser.preferredPosition === 'Power Forward' ? 'selected' : ''}>Power Forward</option>
                                            <option value="Center" ${this.currentUser.preferredPosition === 'Center' ? 'selected' : ''}>Center</option>
                                        </select>
                                    </div>
                                    
                                    <div class="form-group full-width">
                                        <label class="form-label">Bio</label>
                                        <textarea class="form-input form-textarea" id="profile-bio" 
                                                  placeholder="Tell other players about yourself...">${this.currentUser.bio || ''}</textarea>
                                    </div>
                                </div>
                                
                                <div class="form-actions">
                                    <button type="submit" class="primary-button">Update Profile</button>
                                    <button type="button" class="secondary-button" onclick="ballUpApp.logout()">Logout</button>
                                </div>
                            </form>
                        </div>
                        
                        <div class="profile-stats">
                            <h3 class="stats-title">Your Stats</h3>
                            <div class="stats-grid">
                                <div class="stat-item">
                                    <div class="stat-number">${this.currentUser.gamesPlayed || 0}</div>
                                    <div class="stat-label">Games Played</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-number">${this.currentUser.gamesCreated || 0}</div>
                                    <div class="stat-label">Games Created</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-number">${this.currentUser.rating ? this.currentUser.rating.toFixed(1) : '4.5'}</div>
                                    <div class="stat-label">Rating</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-number">${this.currentUser.totalRatings || 0}</div>
                                    <div class="stat-label">Reviews</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    async updateProfile(event) {
        event.preventDefault();
        
        const firstName = document.getElementById('profile-firstname').value;
        const lastName = document.getElementById('profile-lastname').value;
        const skillLevel = document.getElementById('profile-skill-level').value;
        const preferredPosition = document.getElementById('profile-position').value;
        const bio = document.getElementById('profile-bio').value;
        const submitButton = event.target.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        
        try {
            submitButton.innerHTML = '<span class="loading-spinner"></span> Updating...';
            submitButton.disabled = true;
            
            const updateData = { skillLevel };
            if (firstName) updateData.firstName = firstName;
            if (lastName) updateData.lastName = lastName;
            if (preferredPosition) updateData.preferredPosition = preferredPosition;
            if (bio) updateData.bio = bio;
            
            const response = await this.makeAuthenticatedRequest('/users/me', {
                method: 'PUT',
                body: JSON.stringify(updateData)
            });
            
            if (response.ok) {
                const updatedUser = await response.json();
                this.currentUser = updatedUser;
                localStorage.setItem('ballup_user', JSON.stringify(updatedUser));
                
                this.showMessage('Profile updated successfully!', 'success');
            } else {
                const error = await response.json();
                this.showMessage(error.error || 'Failed to update profile', 'error');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            this.showMessage('Error updating profile. Please try again.', 'error');
        } finally {
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    }
    
    // My Games Section
    async renderMyGamesSection(container) {
        container.innerHTML = `
            ${this.renderAppHeader()}
            <div class="app-content">
                <div class="mygames-container">
                    <div class="mygames-header">
                        <h1 class="page-title">My Games</h1>
                        <p class="page-subtitle">Manage your created and joined games</p>
                    </div>
                    
                    <div class="mygames-content" id="mygames-content">
                        <div class="loading-message">Loading your games...</div>
                    </div>
                </div>
            </div>
        `;
        
        await this.loadMyGames();
    }
    
    async loadMyGames() {
        try {
            const response = await this.makeAuthenticatedRequest('/users/me/games');
            
            if (response.ok) {
                const data = await response.json();
                const { createdGames, participatingGames } = data;
                
                const container = document.getElementById('mygames-content');
                container.innerHTML = `
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
                        <h2 class="section-title">Joined Games (${participatingGames.length})</h2>
                        <div class="games-grid">
                            ${participatingGames.length > 0 ? 
                                participatingGames.map(game => this.renderMyGameCard(game, 'participant')).join('') :
                                '<div class="empty-state">No games joined yet. <a href="#" data-nav="games">Find games to join!</a></div>'
                            }
                        </div>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading my games:', error);
            document.getElementById('mygames-content').innerHTML = '<div class="error-state">Error loading games</div>';
        }
    }
    
    renderMyGameCard(game, role) {
        const gameTime = new Date(game.scheduledAt).toLocaleDateString('en-US', {
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
                        <span class="detail-icon">📊</span>
                        <span>Status: ${game.status}</span>
                    </div>
                    <div class="game-detail">
                        <span class="detail-icon">🎯</span>
                        <span>Role: ${role === 'creator' ? 'Creator' : 'Participant'}</span>
                    </div>
                </div>
                
                <div class="game-actions">
                    ${role === 'creator' ? 
                        `<button class="secondary-button" onclick="ballUpApp.cancelGame('${game.id}')">Cancel Game</button>` :
                        `<button class="secondary-button" onclick="ballUpApp.leaveGame('${game.id}')">Leave Game</button>`
                    }
                    <button class="primary-button" onclick="ballUpApp.viewGameDetails('${game.id}')">View Details</button>
                </div>
            </div>
        `;
    }
    
    async cancelGame(gameId) {
        if (!confirm('Are you sure you want to cancel this game? This action cannot be undone.')) {
            return;
        }
        
        try {
            const response = await this.makeAuthenticatedRequest(`/games/${gameId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                this.showMessage('Game cancelled successfully', 'success');
                await this.loadMyGames();
            } else {
                const error = await response.json();
                this.showMessage(error.error || 'Failed to cancel game', 'error');
            }
        } catch (error) {
            console.error('Error cancelling game:', error);
            this.showMessage('Error cancelling game. Please try again.', 'error');
        }
    }
    
    viewGameDetails(gameId) {
        // For now, navigate to games section
        this.navigateTo('games');
    }
    
    // Utility Methods
    showMessage(message, type) {
        const messageEl = document.createElement('div');
        messageEl.className = `message ${type}`;
        messageEl.textContent = message;
        
        document.body.appendChild(messageEl);
        
        setTimeout(() => {
            messageEl.remove();
        }, 5000);
    }
    
    initGamesMap() {
        if (this.gamesMap) {
            this.gamesMap.remove();
        }
        
        this.gamesMap = L.map('games-map').setView([40.4862, -74.4518], 12);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.gamesMap);
        
        // Add games to map
        this.gamesData.forEach(game => {
            if (game.location) {
                const marker = L.marker([game.location.latitude, game.location.longitude])
                    .addTo(this.gamesMap);
                
                const popupContent = `
                    <div class="map-popup">
                        <h4>🏀 ${game.title}</h4>
                        <p><strong>📍 ${game.location.name}</strong></p>
                        <p>📅 ${new Date(game.scheduledAt).toLocaleDateString()}</p>
                        <p>🕐 ${new Date(game.scheduledAt).toLocaleTimeString()}</p>
                        <p>👥 Players: ${game.currentPlayers}/${game.maxPlayers}</p>
                        <p>⭐ Skill: ${game.skillLevel || 'Any'}</p>
                        <button class="primary-button" onclick="ballUpApp.joinGame('${game.id}')">Join Game</button>
                    </div>
                `;
                
                marker.bindPopup(popupContent);
            }
        });
    }
}