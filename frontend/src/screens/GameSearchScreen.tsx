import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
} from 'react-native';
import {Game} from '../types';
import GameMapView from '../components/MapView';
import ErrorBoundary from '../components/ErrorBoundary';

const mockGames: Game[] = [
  {
    id: '1',
    locationId: '1',
    title: 'Pickup Game at Central Park',
    dateTime: '2024-07-29T18:00:00Z',
    maxPlayers: 10,
    currentPlayers: 6,
    skillLevel: 'intermediate',
    description: 'Casual pickup game, all skill levels welcome!',
    status: 'scheduled',
    players: [],
    createdAt: '2024-07-28T12:00:00Z',
    updatedAt: '2024-07-28T12:00:00Z',
    location: {
      id: '1',
      name: 'Central Park Basketball Court',
      address: '123 Park Ave, City, State',
      latitude: 40.7831,
      longitude: -73.9712,
      description: 'Outdoor court with good lighting',
      amenities: ['lighting', 'water fountain'],
      photos: [],
      rating: 4.2,
      isVerified: true,
      createdBy: '1',
      createdAt: '2024-07-20T12:00:00Z',
      updatedAt: '2024-07-20T12:00:00Z',
    },
  },
  {
    id: '2',
    locationId: '2',
    title: 'Beginner Basketball Game',
    dateTime: '2024-07-30T19:30:00Z',
    maxPlayers: 8,
    currentPlayers: 3,
    skillLevel: 'beginner',
    description: 'Beginner-friendly game, come learn!',
    status: 'scheduled',
    players: [],
    createdAt: '2024-07-28T14:00:00Z',
    updatedAt: '2024-07-28T14:00:00Z',
    location: {
      id: '2',
      name: 'Community Center Court',
      address: '456 Community St, City, State',
      latitude: 40.7589,
      longitude: -73.9851,
      description: 'Indoor court, climate controlled',
      amenities: ['indoor', 'parking', 'restrooms'],
      photos: [],
      rating: 4.5,
      isVerified: true,
      createdBy: '2',
      createdAt: '2024-07-22T12:00:00Z',
      updatedAt: '2024-07-22T12:00:00Z',
    },
  },
];

const GameSearchScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [games] = useState(mockGames);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const filteredGames = games.filter(
    game =>
      game.location?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.description?.toLowerCase().includes(searchQuery.toLowerCase()),
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
        <Text style={styles.locationName}>{item.location?.name}</Text>
        <Text style={styles.gameTime}>{formatDate(item.dateTime)}</Text>
      </View>
      
      <Text style={styles.gameDescription}>{item.description}</Text>
      
      <View style={styles.gameDetails}>
        <Text style={styles.detailText}>
          Players: {item.currentPlayers}/{item.maxPlayers}
        </Text>
        <Text style={styles.skillLevel}>
          Skill: {item.skillLevel}
        </Text>
      </View>
      
      <TouchableOpacity style={styles.joinButton}>
        <Text style={styles.joinButtonText}>Join Game</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search games by location or description..."
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
          contentContainerStyle={styles.gamesList}
          showsVerticalScrollIndicator={false}
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