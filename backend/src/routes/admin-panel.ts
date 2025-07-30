import express from 'express';
import { prisma } from '../lib/prisma';

const router = express.Router();

// Admin panel HTML page
router.get('/', async (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>BallUp Database Admin Panel</title>
        <style>
            body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                margin: 20px; 
                background-color: #f5f5f5; 
            }
            .container { 
                max-width: 1200px; 
                margin: 0 auto; 
                background: white; 
                padding: 20px; 
                border-radius: 8px; 
                box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
            }
            h1 { 
                color: #333; 
                text-align: center; 
                margin-bottom: 30px; 
            }
            .stats { 
                display: grid; 
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
                gap: 15px; 
                margin-bottom: 30px; 
            }
            .stat-card { 
                background: #f8f9fa; 
                padding: 15px; 
                border-radius: 5px; 
                text-align: center; 
                border-left: 4px solid #007bff; 
            }
            .stat-number { 
                font-size: 24px; 
                font-weight: bold; 
                color: #007bff; 
            }
            .stat-label { 
                color: #666; 
                margin-top: 5px; 
            }
            .tables { 
                display: flex; 
                gap: 20px; 
                margin-bottom: 20px; 
            }
            .table-btn { 
                padding: 10px 20px; 
                background: #007bff; 
                color: white; 
                border: none; 
                border-radius: 5px; 
                cursor: pointer; 
                text-decoration: none; 
                display: inline-block; 
            }
            .table-btn:hover { 
                background: #0056b3; 
            }
            .table-btn.active { 
                background: #28a745; 
            }
            table { 
                width: 100%; 
                border-collapse: collapse; 
                margin-top: 20px; 
            }
            th, td { 
                padding: 12px; 
                text-align: left; 
                border-bottom: 1px solid #ddd; 
            }
            th { 
                background-color: #f8f9fa; 
                font-weight: 600; 
            }
            tr:hover { 
                background-color: #f5f5f5; 
            }
            .refresh-btn { 
                float: right; 
                padding: 8px 16px; 
                background: #28a745; 
                color: white; 
                border: none; 
                border-radius: 4px; 
                cursor: pointer; 
            }
            .loading { 
                text-align: center; 
                padding: 20px; 
                color: #666; 
            }
            .empty { 
                text-align: center; 
                padding: 40px; 
                color: #888; 
                font-style: italic; 
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🏀 BallUp Database Admin Panel</h1>
            
            <div class="stats" id="stats">
                <div class="stat-card">
                    <div class="stat-number" id="userCount">-</div>
                    <div class="stat-label">Users</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" id="gameCount">-</div>
                    <div class="stat-label">Games</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" id="locationCount">-</div>
                    <div class="stat-label">Locations</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" id="participantCount">-</div>
                    <div class="stat-label">Participants</div>
                </div>
            </div>
            
            <div class="tables">
                <button class="table-btn active" onclick="loadTable('users')">Users</button>
                <button class="table-btn" onclick="loadTable('games')">Games</button>
                <button class="table-btn" onclick="loadTable('locations')">Locations</button>
                <button class="table-btn" onclick="loadTable('game_participants')">Participants</button>
                <button class="table-btn" onclick="loadTable('admin_logs')">Admin Logs</button>
                <button class="refresh-btn" onclick="refreshStats()">🔄 Refresh</button>
            </div>
            
            <div id="tableContent">
                <div class="loading">Loading data...</div>
            </div>
        </div>

        <script>
            let currentTable = 'users';
            
            async function loadStats() {
                try {
                    const response = await fetch('/admin-panel/stats');
                    const stats = await response.json();
                    
                    document.getElementById('userCount').textContent = stats.users;
                    document.getElementById('gameCount').textContent = stats.games;
                    document.getElementById('locationCount').textContent = stats.locations;
                    document.getElementById('participantCount').textContent = stats.participants;
                } catch (error) {
                    console.error('Failed to load stats:', error);
                }
            }
            
            async function loadTable(tableName) {
                currentTable = tableName;
                
                // Update active button
                document.querySelectorAll('.table-btn').forEach(btn => btn.classList.remove('active'));
                event.target.classList.add('active');
                
                const tableContent = document.getElementById('tableContent');
                tableContent.innerHTML = '<div class="loading">Loading data...</div>';
                
                try {
                    const response = await fetch('/admin-panel/table/' + tableName);
                    const data = await response.json();
                    
                    if (data.length === 0) {
                        tableContent.innerHTML = '<div class="empty">No data found in ' + tableName + ' table</div>';
                        return;
                    }
                    
                    // Create table HTML
                    const headers = Object.keys(data[0]);
                    let tableHTML = '<table><thead><tr>';
                    headers.forEach(header => {
                        tableHTML += '<th>' + header + '</th>';
                    });
                    tableHTML += '</tr></thead><tbody>';
                    
                    data.forEach(row => {
                        tableHTML += '<tr>';
                        headers.forEach(header => {
                            let value = row[header];
                            if (value === null) value = '<em>null</em>';
                            if (typeof value === 'string' && value.length > 50) {
                                value = value.substring(0, 50) + '...';
                            }
                            if (header.includes('At') || header.includes('Time')) {
                                value = new Date(value).toLocaleString();
                            }
                            tableHTML += '<td>' + value + '</td>';
                        });
                        tableHTML += '</tr>';
                    });
                    
                    tableHTML += '</tbody></table>';
                    tableContent.innerHTML = tableHTML;
                    
                } catch (error) {
                    tableContent.innerHTML = '<div class="empty">Error loading data: ' + error.message + '</div>';
                }
            }
            
            function refreshStats() {
                loadStats();
                loadTable(currentTable);
            }
            
            // Load initial data
            loadStats();
            loadTable('users');
        </script>
    </body>
    </html>
  `;
  
  res.send(html);
});

// API endpoints for the admin panel
router.get('/stats', async (req, res) => {
  try {
    const [users, games, locations, participants] = await Promise.all([
      prisma.user.count(),
      prisma.game.count(),
      prisma.location.count(),
      prisma.gameParticipant.count(),
    ]);
    
    res.json({
      users,
      games,
      locations,
      participants,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

router.get('/table/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        skillLevel: true,
        preferredPosition: true,
        gamesPlayed: true,
        gamesCreated: true,
        rating: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.get('/table/games', async (req, res) => {
  try {
    const games = await prisma.game.findMany({
      include: {
        creator: { select: { username: true, email: true } },
        location: { select: { name: true, address: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    
    const formattedGames = games.map(game => ({
      id: game.id,
      title: game.title,
      creator: game.creator.username,
      location: game.location.name,
      skillLevel: game.skillLevel,
      maxPlayers: game.maxPlayers,
      currentPlayers: game.currentPlayers,
      status: game.status,
      scheduledAt: game.scheduledAt,
      createdAt: game.createdAt,
    }));
    
    res.json(formattedGames);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch games' });
  }
});

router.get('/table/locations', async (req, res) => {
  try {
    const locations = await prisma.location.findMany({
      include: {
        creator: { select: { username: true, email: true } },
        _count: { select: { games: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    
    const formattedLocations = locations.map(location => ({
      id: location.id,
      name: location.name,
      address: location.address,
      courtType: location.courtType,
      surfaceType: location.surfaceType,
      creator: location.creator.username,
      gameCount: location._count.games,
      rating: location.rating,
      isVerified: location.isVerified,
      createdAt: location.createdAt,
    }));
    
    res.json(formattedLocations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

router.get('/table/game_participants', async (req, res) => {
  try {
    const participants = await prisma.gameParticipant.findMany({
      include: {
        user: { select: { username: true, email: true } },
        game: { select: { title: true } },
      },
      orderBy: { joinedAt: 'desc' },
    });
    
    const formattedParticipants = participants.map(participant => ({
      id: participant.id,
      user: participant.user.username,
      game: participant.game.title,
      status: participant.status,
      joinedAt: participant.joinedAt,
    }));
    
    res.json(formattedParticipants);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch participants' });
  }
});

router.get('/table/admin_logs', async (req, res) => {
  try {
    const logs = await prisma.adminLog.findMany({
      include: {
        admin: { select: { username: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100, // Limit to last 100 logs
    });
    
    const formattedLogs = logs.map(log => ({
      id: log.id,
      admin: log.admin.username,
      action: log.action,
      targetType: log.targetType,
      targetId: log.targetId,
      details: log.details,
      createdAt: log.createdAt,
    }));
    
    res.json(formattedLogs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch admin logs' });
  }
});

export default router;