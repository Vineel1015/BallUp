import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {Game} from '../types';
import GameMapView from '../components/MapView';
import ErrorBoundary from '../components/ErrorBoundary';
import { apiService } from '../services/api';

const GameSearchScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Load games on component mount
  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getGames({ status: 'scheduled' });
      
      // Transform the data to ensure compatibility
      const transformedGames = response.data.map((game: any) => ({
        ...game,
        // Map backend field names to frontend compatibility
        dateTime: game.scheduledAt || game.dateTime,
        skillLevel: game.skillLevel || game.skillLevelRequired || 'any',
        // Ensure we have the required legacy fields
        scheduledTime: game.scheduledAt,
        skillLevelRequired: game.skillLevel,
      }));
      
      setGames(transformedGames);
    } catch (err: any) {
      console.error('Error loading games:', err);
      setError(err.response?.data?.error || 'Failed to load games');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGame = async (gameId: string) => {
    try {
      setLoading(true);
      await apiService.joinGame(gameId);
      Alert.alert('Success', 'You have successfully joined the game!');
      // Refresh the games list
      await loadGames();
    } catch (err: any) {
      console.error('Error joining game:', err);
      Alert.alert('Error', err.response?.data?.error || 'Failed to join game');
    } finally {
      setLoading(false);
    }
  };

  const filteredGames = games.filter(
    game =>
      game.location?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.title?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const renderGame = ({item}: {item: Game}) => (
    <TouchableOpacity style={styles.gameCard}>
      <View style={styles.gameHeader}>
        <Text style={styles.locationName}>{item.location?.name || 'Unknown Location'}</Text>
        <Text style={styles.gameTime}>{formatDate(item.dateTime || item.scheduledAt)}</Text>
      </View>
      
      <Text style={styles.gameTitle}>{item.title}</Text>
      <Text style={styles.gameDescription}>{item.description || 'No description available'}</Text>
      
      <View style={styles.gameDetails}>
        <Text style={styles.detailText}>
          Players: {item.currentPlayers}/{item.maxPlayers}
        </Text>
        {item.duration && (
          <Text style={styles.detailText}>
            Duration: {item.duration} min
          </Text>
        )}
        <Text style={styles.skillLevel}>
          Skill: {item.skillLevel || item.skillLevelRequired || 'Any'}
        </Text>
      </View>
      
      <TouchableOpacity 
        style={[
          styles.joinButton, 
          item.currentPlayers >= item.maxPlayers && styles.fullButton
        ]}
        onPress={() => handleJoinGame(item.id)}
        disabled={loading || item.currentPlayers >= item.maxPlayers}
      >
        <Text style={[
          styles.joinButtonText,
          item.currentPlayers >= item.maxPlayers && styles.fullButtonText
        ]}>
          {item.currentPlayers >= item.maxPlayers ? 'Full' : 'Join Game'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading && games.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>Loading games...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error loading games</Text>
          <Text style={styles.errorSubtext}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadGames}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search games by location, title, or description..."
          placeholderTextColor="#CCCCCC"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'list' && styles.activeToggle]}
            onPress={() => setViewMode('list')}
          >
            <Text style={[styles.toggleText, viewMode === 'list' && styles.activeToggleText]}>
              List
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'map' && styles.activeToggle]}
            onPress={() => setViewMode('map')}
          >
            <Text style={[styles.toggleText, viewMode === 'map' && styles.activeToggleText]}>
              Map
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {viewMode === 'list' ? (
        <FlatList
          data={filteredGames}
          renderItem={renderGame}
          keyExtractor={item => item.id}
          contentContainerStyle={[
            styles.gamesList,
            filteredGames.length === 0 && styles.emptyGamesList
          ]}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={loadGames}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🏀</Text>
              <Text style={styles.emptyTitle}>No games found</Text>
              <Text style={styles.emptyDescription}>
                {searchQuery 
                  ? 'Try adjusting your search criteria' 
                  : 'No scheduled games available right now'
                }
              </Text>
            </View>
          )}
        />
      ) : (
        <ErrorBoundary fallback={
          <View style={styles.mapErrorContainer}>
            <Text style={styles.mapErrorText}>Map failed to load</Text>
            <Text style={styles.mapErrorSubtext}>Please try switching to list view</Text>
          </View>
        }>
          <GameMapView />
        </ErrorBoundary>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#1A1A1A',
    borderBottomWidth: 1,
    borderBottomColor: '#FF6B35',
    width: '100%',
  },
  searchInput: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#FF6B35',
    color: '#FFFFFF',
    width: '90%',
    alignSelf: 'center',
  },
  gamesList: {
    padding: 16,
    gap: 16,
    alignItems: 'center',
  },
  gameCard: {
    backgroundColor: '#1A1A1A',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#FF6B35',
    width: '90%',
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  gameTime: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '600',
  },
  gameDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 12,
    lineHeight: 20,
  },
  gameDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailText: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  skillLevel: {
    fontSize: 12,
    color: '#FF6B35',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  joinButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    width: '90%',
    alignSelf: 'center',
  },
  joinButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  gameTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  fullButton: {
    backgroundColor: '#666666',
  },
  fullButtonText: {
    color: '#CCCCCC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#FFFFFF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyGamesList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  viewToggle: {
    flexDirection: 'row',
    marginTop: 12,
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 2,
    borderWidth: 1,
    borderColor: '#FF6B35',
    width: '90%',
    alignSelf: 'center',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeToggle: {
    backgroundColor: '#FF6B35',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#CCCCCC',
  },
  activeToggleText: {
    color: '#000000',
  },
  mapErrorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
  },
  mapErrorText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  mapErrorSubtext: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
  },
});

export default GameSearchScreen;